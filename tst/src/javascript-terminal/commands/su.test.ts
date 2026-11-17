import { describe, expect, it } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { UserType } from "../../../../api/types";
import { mockPasskey } from "../../../__mocks__/__data__/aws/dynamodb";

describe("su", () => {
    it("should need a user", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("su");

        expect(result).toBe("usage: su <user>");
    });

    it("should deny a signed out visitor", () => {
        const shell = mockShell();

        const result = shell.run("su ada");

        expect(result).toBe("Permission Denied");
    });

    it("should reject someone else's name", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("su bob");

        expect(result).toBe('Unknown User "bob"');
    });

    it("should ask a friend for their passkey", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        shell.run(`su ${mockPasskey.name}`);

        expect(shell.state.getPasswordPromptState()).toEqual({});
    });

    it("should deny a token it cannot read", () => {
        const shell = mockShell({ AUTH_TOKEN: "junk" });

        const result = shell.run("su ada");

        expect(result).toBe("Permission Denied");
    });
});
