import { afterEach, describe, expect, it, vi } from "vitest";

import type { Directory, FileSystem } from "../../src/FileSystem";

async function filesOn(date: Date): Promise<FileSystem> {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(date);
    vi.resetModules();
    return (await import("../../src/FileSystem")).default;
}

function namesIn(fs: FileSystem, folder: string): string[] {
    const root = fs["/"] as Directory;
    return Object.keys((root.contents[folder] as Directory).contents);
}

afterEach(() => {
    vi.useRealTimers();
});

describe("FileSystem", () => {
    it("should keep the usual files on an ordinary day", async () => {
        const result = await filesOn(new Date(2026, 6, 4));

        expect(namesIn(result, "Music")).toEqual(["groovy.mov", "smooth.mp4"]);
    });

    it.each([
        ["pi.txt", new Date(2026, 2, 14), "Documents"],
        ["newyear.txt", new Date(2027, 0, 1), "Documents"],
        ["itsMyBirthday.mkv", new Date(2026, 4, 16), "Music"],
        ["isItThatTime.avi", new Date(2026, 8, 21), "Music"]
    ])("should add %s on its day", async (file, date, folder) => {
        const result = await filesOn(date);

        expect(namesIn(result, folder)).toContain(file);
    });

    it("should wish the right year a happy new year", async () => {
        const result = await filesOn(new Date(2027, 0, 1));

        const documents = (result["/"] as Directory).contents.Documents as Directory;
        expect(documents.contents["newyear.txt"]?.contents).toContain("Happy New Year 2027");
    });
});
