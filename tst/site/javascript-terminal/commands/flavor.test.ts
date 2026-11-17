import { describe, expect, it } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { UserType } from "../../../../api/types";

describe("flavor", () => {
    it("should need a flavor", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("flavor");

        expect(result).toBe("usage: flavor <flavor name>");
    });

    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("flavor mint");

        expect(result).toBe("Permission Denied");
    });

    it("should deny a subscriber", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.SUBSCRIBER) });

        const result = shell.run("flavor mint");

        expect(result).toBe("Permission Denied");
    });

    it("should send a friend's suggestion", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("flavor mint chip");

        expect(result).toBe("Flavor Suggestion Sent");
    });
});
