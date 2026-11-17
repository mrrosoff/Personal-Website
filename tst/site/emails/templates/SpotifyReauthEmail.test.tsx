import { describe, expect, it } from "vitest";

import { renderEmail } from "../../../helpers/render";

import SpotifyReauthEmail from "../../../../site/emails/templates/SpotifyReauthEmail";

describe("SpotifyReauthEmail", () => {
    it("should greet the owner and count down the days", async () => {
        const result = await renderEmail(
            <SpotifyReauthEmail name={"Ada"} daysLeft={5} reconnectUrl={"https://maxrosoff.com"} />
        );

        expect(result).toContain("Hi Ada,");
        expect(result).toContain("5 days");
        expect(result).toContain("sudo su Ada");
    });

    it("should handle a display nobody owns with one day left", async () => {
        const result = await renderEmail(
            <SpotifyReauthEmail daysLeft={1} reconnectUrl={"https://maxrosoff.com"} />
        );

        expect(result).toContain("Hi,");
        expect(result).toContain("1 day");
        expect(result).toContain("your name");
    });
});
