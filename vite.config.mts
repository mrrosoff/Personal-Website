import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (
                            id.includes("/@mui/") ||
                            id.includes("/@emotion/") ||
                            id.includes("/@popperjs/")
                        ) {
                            return "mui";
                        }
                    }
                }
            }
        }
    },
    server: {
        port: 3000,
        strictPort: true,
        open: true
    }
});
