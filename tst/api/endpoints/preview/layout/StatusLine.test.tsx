import { afterEach, describe, expect, it, vi } from "vitest";

import StatusLine, { expiry } from "../../../../../api/endpoints/preview/layout/StatusLine";

afterEach(() => {
    vi.useRealTimers();
});

describe("StatusLine", () => {
    it("should show a good status in green", () => {
        const result = JSON.stringify(
            StatusLine({ label: "Booting OS", status: "SUCCESS", ok: true })
        );

        expect(result).toContain("#2BC903");
    });

    it("should show a bad status in red", () => {
        const result = JSON.stringify(
            StatusLine({ label: "Booting OS", status: "FAILED", ok: false })
        );

        expect(result).toContain("#ff0606");
    });
});

describe("expiry", () => {
    it("should give the date in San Francisco time", () => {
        vi.useFakeTimers({ now: new Date("2026-11-17T20:00:00Z"), toFake: ["Date"] });

        const result = expiry(Date.parse("2026-11-20T20:00:00Z") / 1000);

        expect(result).toEqual({ date: "NOV 20, 12:00 PM", expired: false });
    });

    it("should say when it has already passed", () => {
        const result = expiry(Date.now() / 1000 - 60);

        expect(result.expired).toBe(true);
    });
});
