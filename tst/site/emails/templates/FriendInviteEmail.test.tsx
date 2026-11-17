import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import FriendInviteEmail from "../../../../site/emails/templates/FriendInviteEmail";

describe("FriendInviteEmail", () => {
    it("should invite the friend by name with a link that expires", async () => {
        const result = await renderEmail(
            <FriendInviteEmail
                friendName={"Zed"}
                inviteUrl={"https://maxrosoff.com/register-friend?token=t"}
                validFor={"1 Day"}
            />
        );

        expect(result).toContain("Zed");
        expect(result).toContain("https://maxrosoff.com/register-friend?token=t");
        expect(result).toContain("1 Day");
    });
});
