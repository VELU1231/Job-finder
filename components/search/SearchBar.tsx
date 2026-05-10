"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";

type SuggestionItem = {
  key: string;
  label: string;
  type: "recent" | "api" | "category";
  href?: string;
};

const RECENT_KEY = "jobfinder:recent-searches";
const categoryShortcuts = ["All Tech Jobs →", "All Design Jobs →", "All Marketing Jobs →"];
const trendingSearches = ["Remote React", "Product Designer", "Data Scientist", "DevOps Engineer"];

function normalizeRecent(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 6);
}

export function SuggestionSkeleton() {
  return (
    <div className="space-y-2 p-3">
      <div className="skeleton-shimmer h-9 rounded-lg" />
      <div className="skeleton-shimmer h-9 rounded-lg" />
      <div className="skeleton-shimmer h-9 rounded-lg" />
      <div className="skeleton-shimmer h-9 rounded-lg" />
    </div>
  );
}

export function SearchBar({ placeholder = "Search jobs, companies, or locations" }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "searchbar-suggestions";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      setRecent(saved ? normalizeRecent(JSON.parse(saved)) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsDropdownOpen(true);
      }
    }

    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setApiSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/jobs?suggest=true&q=${encodeURIComponent(query.trim())}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          setApiSuggestions([]);
          return;
        }

        const payload = (await response.json()) as {
          data?: Array<{ title?: string } | string>;
        };

        const titles = (payload.data ?? [])
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }
            return item.title ?? "";
          })
          .filter((item): item is string => Boolean(item))
          .slice(0, 6);

        setApiSuggestions(titles);
      } catch {
        setApiSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.delete("cursor");
      router.replace(`/jobs?${params.toString()}`);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, router, searchParams]);

  const suggestions = useMemo<SuggestionItem[]>(() => {
    const items: SuggestionItem[] = [];
    const sourceRecent = query.trim() ? recent.filter((item) => item.toLowerCase().includes(query.toLowerCase())) : recent;

    sourceRecent.slice(0, 3).forEach((item, index) => {
      items.push({ key: `recent-${index}-${item}`, label: item, type: "recent" });
    });

    apiSuggestions.slice(0, 3).forEach((item, index) => {
      items.push({ key: `api-${index}-${item}`, label: item, type: "api" });
    });

    categoryShortcuts
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .forEach((item, index) => {
        const normalized = item.toLowerCase().replaceAll(" ", "-");
        items.push({ key: `category-${index}-${normalized}`, label: item, type: "category", href: `/jobs?category=${normalized}` });
      });

    const deduped = new Map<string, SuggestionItem>();
    for (const item of items) {
      if (!deduped.has(item.label.toLowerCase())) {
        deduped.set(item.label.toLowerCase(), item);
      }
    }

    return Array.from(deduped.values()).slice(0, 6);
  }, [apiSuggestions, query, recent]);

  function updateRecent(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    const next = [trimmed, ...recent.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // Ignore localStorage write errors.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateRecent(query);
    setIsDropdownOpen(false);
    setIsMobileOverlayOpen(false);
    inputRef.current?.blur();
  }

  function handleSelect(item: SuggestionItem) {
    if (item.href) {
      router.push(item.href);
      setIsDropdownOpen(false);
      setIsMobileOverlayOpen(false);
      return;
    }

    setQuery(item.label);
    updateRecent(item.label);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsDropdownOpen(true);
      setSelectedIndex((current) => Math.min(current + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      event.preventDefault();
      handleSelect(suggestions[selectedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
      setIsMobileOverlayOpen(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        role="search"
        className="relative rounded-3xl border border-surface-border bg-surface-0 p-3 shadow-card"
      >
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-muted" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isDropdownOpen}
              aria-controls={listboxId}
              aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-${selectedIndex}` : undefined}
              placeholder={placeholder}
              className="h-14 w-full rounded-2xl border border-surface-border bg-surface-1 pl-12 pr-20 text-base text-surface-foreground placeholder-transparent"
            />
            {!query ? <span aria-hidden="true" className="rotating-placeholder" /> : null}
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="tap-target absolute right-11 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-surface-muted transition hover:bg-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-surface-border bg-surface-0 px-2 py-1 text-xs text-surface-muted lg:inline">
              ⌘K
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-14 w-full items-center gap-3 rounded-2xl border border-surface-border bg-surface-1 px-4 text-left md:hidden"
          onClick={() => setIsMobileOverlayOpen(true)}
          aria-label="Open full screen mobile search"
        >
          <Search className="h-5 w-5 text-surface-muted" />
          <span className={query ? "text-surface-foreground" : "text-surface-muted"}>{query || placeholder}</span>
        </button>

        {isDropdownOpen ? (
          <div className="absolute inset-x-3 top-[calc(100%-0.25rem)] z-30 hidden rounded-2xl border border-surface-border bg-surface-0 shadow-modal md:block">
            {isLoadingSuggestions ? (
              <SuggestionSkeleton />
            ) : (
              <ul id={listboxId} role="listbox" className="py-2">
                {suggestions.length ? (
                  suggestions.map((item, index) => (
                    <li key={item.key} id={`${listboxId}-${index}`} role="option" aria-selected={index === selectedIndex}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(item)}
                        className={`tap-target flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                          index === selectedIndex ? "bg-brand-50 text-brand-700" : "text-surface-foreground"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs uppercase tracking-wide text-surface-muted">{item.type}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-surface-muted">No suggestions yet.</li>
                )}
              </ul>
            )}
          </div>
        ) : null}
      </form>

      {isMobileOverlayOpen ? (
        <div className="fixed inset-0 z-[70] bg-surface-0 p-4 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile search overlay">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-muted" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={placeholder}
                className="h-12 w-full rounded-xl border border-surface-border bg-surface-1 pl-10 pr-4 text-sm text-surface-foreground"
                autoFocus
              />
            </div>
            <button
              type="button"
              aria-label="Close mobile search"
              onClick={() => {
                setIsMobileOverlayOpen(false);
                setIsDropdownOpen(false);
              }}
              className="tap-target inline-flex h-12 w-12 items-center justify-center rounded-xl border border-surface-border bg-surface-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-surface-foreground">Recent searches</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {recent.length ? (
                recent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect({ key: `mobile-${item}`, label: item, type: "recent" })}
                    className="tap-target rounded-full border border-surface-border bg-surface-1 px-3 py-2 text-sm text-surface-foreground"
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p className="text-sm text-surface-muted">No recent searches yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-surface-foreground">Trending</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {trendingSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelect({ key: `trend-${item}`, label: item, type: "recent" })}
                  className="tap-target rounded-full bg-brand-50 px-3 py-2 text-sm text-brand-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .rotating-placeholder {
          pointer-events: none;
          position: absolute;
          left: 3rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-surface-muted);
          font-size: 1rem;
        }

        .rotating-placeholder::after {
          content: "React Developer";
          animation: rotatePlaceholder 9s infinite;
        }

        @keyframes rotatePlaceholder {
          0%,
          29% {
            content: "React Developer";
          }

          33%,
          62% {
            content: "Remote Marketing";
          }

          66%,
          100% {
            content: "Healthcare Manager";
          }
        }
      `}</style>
    </>
  );
}

export default SearchBar;