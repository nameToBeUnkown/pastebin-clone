export interface Paste {
  id: string;
  title: string;
  content: string;
  language: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CreatePasteInput {
  title: string;
  content: string;
  language: string;
  expiration: PasteExpiration;
}

export interface PasteResponse {
  id: string;
  title: string;
  content: string;
  language: string;
  expiresAt: string | null;
  createdAt: string;
}

export type PasteExpiration = "never" | "10m" | "1h" | "1d" | "7d" | "30d";

export const PASTE_EXPIRATION_LABELS: Record<PasteExpiration, string> = {
  never: "Never",
  "10m": "10 Minutes",
  "1h": "1 Hour",
  "1d": "1 Day",
  "7d": "7 Days",
  "30d": "30 Days",
};

export const EXPIRATION_MS: Record<PasteExpiration, number | null> = {
  never: null,
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export const SUPPORTED_LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "c",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "xml",
  "yaml",
  "markdown",
  "dockerfile",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
