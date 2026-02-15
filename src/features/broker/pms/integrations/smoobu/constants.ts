// import.meta.env is populated by Vite from .env during astro dev.
// In production Workers builds the var is undefined → falls back to real URL.
export const SMOOBU_BASE_URL: string =
  import.meta.env.SMOOBU_BASE_URL ?? "https://login.smoobu.com";
