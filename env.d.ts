/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other env variables you need here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
