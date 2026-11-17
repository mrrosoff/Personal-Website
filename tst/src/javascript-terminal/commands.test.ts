import { afterEach, describe, expect, it, vi } from "vitest";

async function commandsOn(date: Date) {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(date);
    vi.resetModules();
    return (await import("../../../src/javascript-terminal/commands")).default;
}

afterEach(() => {
    vi.useRealTimers();
});

describe("commands", () => {
    it("should haunt the terminal on halloween", async () => {
        const result = await commandsOn(new Date(2026, 9, 31));

        expect(result).toHaveProperty("haunt");
    });

    it("should rest the rest of the year", async () => {
        const result = await commandsOn(new Date(2026, 9, 30));

        expect(result).not.toHaveProperty("haunt");
    });
});
