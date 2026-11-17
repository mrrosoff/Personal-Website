import { describe, expect, it } from "vitest";

import { mockShell, mockToken } from "../../../setup";
import { UserType } from "../../../../api/types";

describe("console", () => {
    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("console");

        expect(result).toBe("Permission Denied");
    });

    it("should deny a friend", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("console");

        expect(result).toBe("Permission Denied");
    });

    it("should open the admin console for the admin", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });

        shell.run("console");

        expect(shell.state.getAdminConsoleMode()?.screen).toBe("main");
    });
});
