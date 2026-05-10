"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/upload-resume", label: "Upload Resume" }
];

export function Navbar() {
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeUnderline, setActiveUnderline] = useState({ left: 0, width: 0 });

  const activePath = useMemo(() => {
    if (pathname === "/") {
      return "/";
    }

    const matched = navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href));
    return matched?.href ?? pathname;
  }, [pathname]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsScrolled(!entry.isIntersecting);
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = desktopNavRef.current;
    if (!nav) {
      return;
    }

    const active = nav.querySelector<HTMLAnchorElement>(`a[data-nav-link=\"${activePath}\"]`);
    if (!active) {
      setActiveUnderline({ left: 0, width: 0 });
      return;
    }

    setActiveUnderline({
      left: active.offsetLeft,
      width: active.offsetWidth
    });
  }, [activePath]);

  useEffect(() => {
    function handleResize() {
      const nav = desktopNavRef.current;
      if (!nav) {
        return;
      }

      const active = nav.querySelector<HTMLAnchorElement>(`a[data-nav-link=\"${activePath}\"]`);
      if (active) {
        setActiveUnderline({ left: active.offsetLeft, width: active.offsetWidth });
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activePath]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-base ${
          isScrolled
            ? "h-14 border-b border-surface-border bg-surface-0/90"
            : "h-16 border-b border-transparent bg-surface-0/75"
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-surface-foreground" aria-label="Go to homepage">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              JF
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight">JobFinder</span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <nav ref={desktopNavRef} className="relative flex items-center gap-1">
              <span
                aria-hidden="true"
                className="absolute bottom-0 h-0.5 rounded-full bg-brand-500 transition-all duration-slow ease-smooth"
                style={{ left: activeUnderline.left, width: activeUnderline.width }}
              />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-nav-link={item.href}
                  className={`relative rounded-full px-3 py-2 text-sm font-medium text-surface-foreground/90 transition-colors hover:text-surface-foreground ${
                    activePath === item.href ? "text-surface-foreground" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              aria-label="Open search"
              className="tap-target inline-flex items-center justify-center rounded-full border border-surface-border bg-surface-1 p-2 text-surface-foreground/80 transition hover:bg-surface-2"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/post-job"
              className="tap-target inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:translate-y-[-1px] hover:bg-brand-600"
            >
              Post a Job
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label="Expand mobile search"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="tap-target inline-flex items-center justify-center rounded-full border border-surface-border bg-surface-1 p-2 text-surface-foreground"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="tap-target inline-flex items-center justify-center rounded-full border border-surface-border bg-surface-1 p-2 text-surface-foreground"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={`border-t border-surface-border bg-surface-0 px-4 py-3 transition-all duration-base md:hidden ${
            isMobileSearchOpen ? "max-h-20 opacity-100" : "max-h-0 overflow-hidden border-transparent py-0 opacity-0"
          }`}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-muted" />
            <input
              type="search"
              placeholder="Search jobs"
              className="h-10 w-full rounded-full border border-surface-border bg-surface-1 pl-9 pr-3 text-sm text-surface-foreground"
            />
          </div>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-surface-foreground/45"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative mx-auto mt-20 w-[min(92vw,26rem)] rounded-2xl bg-surface-0 p-6 shadow-modal">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="tap-target absolute right-3 top-3 inline-flex items-center justify-center rounded-full border border-surface-border bg-surface-1 p-2"
            >
              <X className="h-4 w-4" />
            </button>

            <nav className="flex min-h-[56vh] flex-col items-center justify-center gap-8 text-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-display text-3xl font-semibold ${
                    activePath === item.href ? "text-brand-600" : "text-surface-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/post-job"
                className="tap-target inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white"
              >
                Post a Job
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Navbar;