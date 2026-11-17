import { describe, expect, it, vi } from "vitest";

import { mockShell } from "../../../helpers/terminal";
import { mockToken } from "../../../setup";
import { UserType } from "../../../../api/types";

describe("export", () => {
    it("should set a variable", () => {
        const shell = mockShell();
        shell.run("export COLOR=blue");

        const result = shell.run("printenv COLOR");

        expect(result).toBe("blue");
    });

    it("should list every variable", () => {
        const shell = mockShell();

        const result = shell.run("export");

        expect(result).toBe("cwd=/");
    });

    it("should reject a bad assignment", () => {
        const shell = mockShell();

        const result = shell.run("export nope");

        expect(result).toBe("export: invalid syntax. Use: export VAR=value");
    });

    it("should remember a valid sign in for the session", async () => {
        const setItem = vi.fn();
        vi.stubGlobal("sessionStorage", { setItem });
        const token = await mockToken(UserType.ADMIN);
        const shell = mockShell();

        shell.run(`export AUTH_TOKEN=${token}`);

        expect(setItem).toHaveBeenCalledWith("AUTH_TOKEN", token);
    });
});
