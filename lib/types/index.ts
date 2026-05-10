export type JobType = "full-time" | "part-time" | "contract" | "internship" | "freelance";

export interface Job {
  id: string;
  title: string;
  company: string | null;
  logo_url: string | null;
  location: string | null;
  country: string | null;
  remote: boolean;
  job_type: JobType | null;
  category: string | null;
  description: string | null;
  apply_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  source: string;
  source_id: string;
  tags: string[];
  posted_at: string | null;
  fetched_at: string;
  is_active: boolean;
  views: number;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  country: string | null;
  size: string | null;
  industry: string | null;
  created_at: string;
}

export interface Resume {
  id: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  file_type: "pdf" | "docx";
  session_id: string | null;
  uploaded_at: string;
}

export interface SyncLog {
  id: string;
  source: string;
  jobs_fetched: number;
  jobs_upserted: number;
  jobs_failed: number;
  jobs_expired: number;
  error_message: string | null;
  duration_ms: number | null;
  synced_at: string;
}

export interface JobFilters {
  q?: string;
  category?: string[];
  remote?: boolean;
  country?: string;
  job_type?: JobType[];
  minSalary?: number;
  maxSalary?: number;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    nextCursor?: string | null;
    total?: number;
  };
}

export interface NormalizedJob {
  title: string;
  company: string | null;
  logo_url: string | null;
  location: string | null;
  country: string | null;
  remote: boolean;
  job_type: JobType | null;
  category: string | null;
  description: string | null;
  apply_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  source: string;
  source_id: string;
  tags: string[];
  posted_at: string | null;
}
