import { describe, expect, it } from "vitest";

import { mockShell } from "../../../setup";

describe("echo", () => {
    it("should print its arguments", () => {
        const shell = mockShell();

        const result = shell.run("echo hello world");

        expect(result).toBe("hello world");
    });

    it("should expand variables", () => {
        const shell = mockShell({ NAME: "max" });

        const result = shell.run("echo hi $NAME");

        expect(result).toBe("hi max");
    });

    it("should strip surrounding quotes", () => {
        const shell = mockShell();

        const result = shell.run('echo "quoted"');

        expect(result).toBe("quoted");
    });
});
