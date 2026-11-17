import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tst/smoke",
    use: { baseURL: "http://localhost:4173" },
    projects: [
        { name: "chrome", use: { ...devices["Desktop Chrome"] } },
        { name: "safari", use: { ...devices["Desktop Safari"] } },
        { name: "iphone", use: { ...devices["iPhone 17"] } },
        { name: "ipad", use: { ...devices["iPad Pro 11"] } },
        { name: "pixel", use: { ...devices["Pixel 10"] } },
        { name: "galaxy", use: { ...devices["Galaxy S24"] } },
        { name: "moto", use: { ...devices["Moto G4"] } }
    ],
    webServer: {
        command: "npx vite build && npx vite preview --port 4173 --strictPort",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI
    }
});
