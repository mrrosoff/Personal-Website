import { fromIni, fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { describe, expect, it, vi } from "vitest";

vi.mock("@aws-sdk/credential-providers", () => ({
    fromIni: vi.fn(),
    fromNodeProviderChain: vi.fn()
}));

const credentials = { accessKeyId: "id", secretAccessKey: "secret" };

async function sdkSettings() {
    vi.resetModules();
    return (await import("../../../api/aws/common")).SDK_SETTINGS;
}

describe("SDK_SETTINGS", () => {
    it("should use the website profile when running locally", async () => {
        vi.mocked(fromIni).mockReturnValue(async () => credentials);
        const settings = await sdkSettings();

        const result = await settings.credentials!();

        expect(result).toBe(credentials);
        expect(fromIni).toHaveBeenCalledWith({ profile: "website" });
    });

    it("should fall back to the default credentials without that profile", async () => {
        vi.mocked(fromIni).mockReturnValue(async () => {
            throw new Error("no profile");
        });
        vi.mocked(fromNodeProviderChain).mockReturnValue(async () => credentials);
        const settings = await sdkSettings();

        const result = await settings.credentials!();

        expect(result).toBe(credentials);
    });

    it("should let Lambda supply credentials", async () => {
        vi.stubEnv("LAMBDA_TASK_ROOT", "/var/task");

        const result = await sdkSettings();

        expect(result).toEqual({});
    });
});
