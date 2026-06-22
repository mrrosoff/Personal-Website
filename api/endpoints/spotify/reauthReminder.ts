import { DateTime, Duration } from "luxon";
import { Resend } from "resend";

import { PASSKEYS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import SpotifyReauthEmail from "../../../src/emails/SpotifyReauthEmail";
import { getAllItems } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import { UserType } from "../../types";

const TOKEN_LIFETIME = Duration.fromObject({ months: 6 });
const REMINDER_LEAD = Duration.fromObject({ days: 14 });

const REFRESH_TOKEN_SET_AT_PARAM = "/website/spotify/refresh-token-set-at";

const FROM = "Spotify Display <display@ice-cream.maxrosoff.com>";
const RECONNECT_URL = "https://maxrosoff.com";
const FALLBACK_RECIPIENT = "me@maxrosoff.com";

export const handler = async (): Promise<void> => {
    const setAt = Number(await getParameter(REFRESH_TOKEN_SET_AT_PARAM));
    if (!setAt) {
        return;
    }

    const expiry = DateTime.fromMillis(setAt).plus(TOKEN_LIFETIME);
    const now = DateTime.now();
    if (now < expiry.minus(REMINDER_LEAD) || now > expiry) {
        return;
    }

    const { email, name } = await resolveOwner();
    const daysLeft = Math.max(0, Math.ceil(expiry.diff(now, "days").days));

    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from: FROM,
        to: email,
        replyTo: "me@maxrosoff.com",
        subject: "Reconnect Spotify to keep the display running",
        react: SpotifyReauthEmail({ name, daysLeft, reconnectUrl: RECONNECT_URL })
    });
    if (error) {
        console.error(error);
        throw new Error("Error Sending Spotify Reauth Email");
    }
};

async function resolveOwner(): Promise<{ email: string; name?: string }> {
    const passkeys = await getAllItems(PASSKEYS_TABLE);
    const owner = passkeys.find((p) => p.userType === UserType.SPOTIFY_OWNER);
    return owner ? { email: owner.email, name: owner.name } : { email: FALLBACK_RECIPIENT };
}
