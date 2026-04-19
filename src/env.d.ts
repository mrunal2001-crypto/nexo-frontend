/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_RAZORPAY_KEY_ID: string
    readonly VITE_RAZORPAY_KEY_SECRET: string
    readonly VITE_RAZORPAY_ACCOUNT_NUMBER?: string
    readonly VITE_API_BASE_URL?: string
    // add more Vite env vars here as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {};
