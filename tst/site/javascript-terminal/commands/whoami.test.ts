import { describe, expect, it } from "vitest";

import { mockToken } from "../../../setup";
import { mockShell } from "../../../helpers/terminal";
import { UserType } from "../../../../api/types";
import { mockPasskey } from "../../../fixtures/aws/dynamodb";

describe("whoami", () => {
    it("should be dev when signed out", () => {
        const shell = mockShell();

        const result = shell.run("whoami");

        expect(result).toBe("dev");
    });

    it("should be admin for the admin", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });

        const result = shell.run("whoami");

        expect(result).toBe("admin");
    });

    it("should be the friend's name for a friend", async () => {
        const shell = mockShell({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        const result = shell.run("whoami");

        expect(result).toBe(mockPasskey.name);
    });
});
