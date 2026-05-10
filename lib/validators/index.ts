import { z } from "zod";

const nullableString = z.string().nullable().optional();

export const RemoteOKJobSchema = z.object({
  id: z.number().optional(),
  slug: z.string().optional(),
  position: z.string().optional(),
  company: nullableString,
  logo: nullableString,
  location: nullableString,
  description: nullableString,
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  date: z.string().optional(),
  url: nullableString
});

export const ArbeitnowJobSchema = z.object({
  slug: z.string(),
  title: z.string(),
  company_name: nullableString,
  location: nullableString,
  description: nullableString,
  remote: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  url: nullableString,
  created_at: z.string().optional()
});

export const HimalayasJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  companyName: nullableString,
  location: nullableString,
  description: nullableString,
  applyUrl: nullableString,
  postedAt: z.string().optional(),
  remote: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export const RemotiveJobSchema = z.object({
  id: z.number(),
  title: z.string(),
  company_name: nullableString,
  candidate_required_location: nullableString,
  description: nullableString,
  url: nullableString,
  publication_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: nullableString,
  salary: nullableString
});

export const JobicyJobSchema = z.object({
  id: z.union([z.string(), z.number()]),
  jobTitle: z.string().optional(),
  title: z.string().optional(),
  companyName: nullableString,
  companyLogo: nullableString,
  jobGeo: nullableString,
  jobLevel: nullableString,
  jobType: nullableString,
  jobDescription: nullableString,
  url: nullableString,
  pubDate: z.string().optional(),
  jobTags: z.array(z.string()).optional()
});

export const MuseJobSchema = z.object({
  id: z.number(),
  name: z.string(),
  company: z.object({ name: z.string().optional() }).optional(),
  locations: z.array(z.object({ name: z.string().optional() })).optional(),
  contents: nullableString,
  refs: z.object({ landing_page: nullableString }).optional(),
  publication_date: z.string().optional(),
  categories: z.array(z.object({ name: z.string().optional() })).optional(),
  levels: z.array(z.object({ name: z.string().optional() })).optional()
});

export const JSearchJobSchema = z.object({
  job_id: z.string(),
  job_title: z.string(),
  employer_name: nullableString,
  employer_logo: nullableString,
  job_city: nullableString,
  job_country: nullableString,
  job_description: nullableString,
  job_apply_link: nullableString,
  job_posted_at_datetime_utc: z.string().optional(),
  job_employment_type: nullableString
});

export const AdzunaJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.object({ display_name: z.string().optional() }).optional(),
  location: z.object({ display_name: z.string().optional(), area: z.array(z.string()).optional() }).optional(),
  description: nullableString,
  redirect_url: nullableString,
  created: z.string().optional(),
  contract_type: nullableString,
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional()
});

export const NormalizedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().nullable(),
  logo_url: z.string().nullable(),
  location: z.string().nullable(),
  country: z.string().nullable(),
  remote: z.boolean(),
  job_type: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]).nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  apply_url: z.string().nullable(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  currency: z.string(),
  source: z.string().min(1),
  source_id: z.string().min(1),
  tags: z.array(z.string()),
  posted_at: z.string().nullable()
});

export type RemoteOKJob = z.infer<typeof RemoteOKJobSchema>;
export type ArbeitnowJob = z.infer<typeof ArbeitnowJobSchema>;
export type HimalayasJob = z.infer<typeof HimalayasJobSchema>;
export type RemotiveJob = z.infer<typeof RemotiveJobSchema>;
export type JobicyJob = z.infer<typeof JobicyJobSchema>;
export type MuseJob = z.infer<typeof MuseJobSchema>;
export type JSearchJob = z.infer<typeof JSearchJobSchema>;
export type AdzunaJob = z.infer<typeof AdzunaJobSchema>;
export type NormalizedJob = z.infer<typeof NormalizedJobSchema>;
