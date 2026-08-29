import { DateTime, Duration } from "luxon";
import { Resend } from "resend";
import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../common";

import SpotifyReauthEmail from "../../../src/emails/SpotifyReauthEmail";
import { getAllItems } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import { DeviceKind } from "../../types";
import { refreshTokenSetAtParam } from "./exchange";

const TOKEN_LIFETIME = Duration.fromObject({ months: 6 });
const REMINDER_LEAD = Duration.fromObject({ days: 14 });

const FALLBACK_RECIPIENT = "me@maxrosoff.com";

export const handler = async (): Promise<void> => {
    const devices = await getAllItems(DEVICES_TABLE);
    const displays = devices.filter((device) => device.kind === DeviceKind.SPOTIFY);

    for (const display of displays) {
        await remindIfDue(display.deviceId, display.ownerEmail);
    }
};

async function remindIfDue(deviceId: string, ownerEmail: string): Promise<void> {
    const setAt = Number(await getParameter(refreshTokenSetAtParam(deviceId)));
    if (!setAt) {
        return;
    }

    const expiry = DateTime.fromMillis(setAt).plus(TOKEN_LIFETIME);
    const now = DateTime.now();
    if (now < expiry.minus(REMINDER_LEAD) || now > expiry) {
        return;
    }

    const { email, name } = await resolveOwner(ownerEmail);
    const daysLeft = Math.max(0, Math.ceil(expiry.diff(now, "days").days));

    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from: "Spotify Display <display@ice-cream.maxrosoff.com>",
        to: email,
        replyTo: "me@maxrosoff.com",
        subject: "Reconnect Spotify to keep the display running",
        react: SpotifyReauthEmail({ name, daysLeft, reconnectUrl: "https://maxrosoff.com" })
    });
    if (error) {
        console.error(error);
        throw new Error("Error Sending Spotify Reauth Email");
    }
}

// The passkey is only for the display name; the device row already says who to
// reach, so an owner without one still gets the mail.
async function resolveOwner(ownerEmail: string): Promise<{ email: string; name?: string }> {
    const passkeys = await getAllItems(PASSKEYS_TABLE);
    const owner = passkeys.find((passkey) => passkey.email === ownerEmail);
    return { email: ownerEmail || FALLBACK_RECIPIENT, name: owner?.name };
}
