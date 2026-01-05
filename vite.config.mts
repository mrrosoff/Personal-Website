import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    root: process.env.PASSKEY ?? "scripts/passkeyRegistrationUI",
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        open: true
    }
});
