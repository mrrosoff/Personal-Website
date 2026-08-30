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
    const grants = await getAllItems(DEVICES_TABLE);
    const owners = new Map<string, string[]>();
    for (const grant of grants) {
        if (grant.kind === DeviceKind.SPOTIFY) {
            owners.set(grant.deviceId, [...(owners.get(grant.deviceId) ?? []), grant.ownerEmail]);
        }
    }

    for (const [deviceId, ownerEmails] of owners) {
        await remindIfDue(deviceId, ownerEmails);
    }
};

async function remindIfDue(deviceId: string, ownerEmails: string[]): Promise<void> {
    const setAt = Number(await getParameter(refreshTokenSetAtParam(deviceId)));
    if (!setAt) {
        return;
    }

    const expiry = DateTime.fromMillis(setAt).plus(TOKEN_LIFETIME);
    const now = DateTime.now();
    if (now < expiry.minus(REMINDER_LEAD) || now > expiry) {
        return;
    }

    const daysLeft = Math.max(0, Math.ceil(expiry.diff(now, "days").days));
    const recipients = ownerEmails.length ? ownerEmails : [FALLBACK_RECIPIENT];

    // The passkey is only for the greeting; the device row already says who to
    // reach, so an owner without one still gets the mail.
    const passkeys = await getAllItems(PASSKEYS_TABLE);
    const resend = new Resend(await getParameter("/website/resend/api-key"));

    const sent = await Promise.all(
        recipients.map((email) =>
            resend.emails.send({
                from: "Spotify Display <display@ice-cream.maxrosoff.com>",
                to: email,
                replyTo: "me@maxrosoff.com",
                subject: "Reconnect Spotify to keep the display running",
                react: SpotifyReauthEmail({
                    name: passkeys.find((passkey) => passkey.email === email)?.name,
                    daysLeft,
                    reconnectUrl: "https://maxrosoff.com"
                })
            })
        )
    );

    const failures = sent.map(({ error }) => error).filter((error) => error !== null);
    if (failures.length) {
        failures.forEach((error) => console.error(error));
        throw new Error("Error Sending Spotify Reauth Email");
    }
}
