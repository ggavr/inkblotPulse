import { z } from "zod";
import { ALL_TROPES } from "./constants";
import { isSafeHttpsUrl } from "./url";

const tropeSchema = z.enum(ALL_TROPES as unknown as [string, ...string[]]);

export const bookInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required").max(200),
  author: z.string().trim().min(1, "Author is required").max(100),
  synopsis: z.string().trim().max(2000).default(""),
  buy_link: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isSafeHttpsUrl(v),
      "Buy link must be a valid https:// URL"
    )
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  cover_bg: z.string().trim().min(1).max(500),
  cover_text: z.string().trim().min(1).max(32),
  tags: z.array(tropeSchema).min(1, "Pick at least one tag").max(12),
});

export type BookInput = z.infer<typeof bookInputSchema>;

export const excerptInputSchema = z.object({
  id: z.string().uuid().optional(),
  book_id: z.string().uuid(),
  text: z
    .string()
    .trim()
    .min(50, "Excerpt must be at least 50 characters")
    .max(10_000, "Excerpt is too long"),
});

export type ExcerptInput = z.infer<typeof excerptInputSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});
