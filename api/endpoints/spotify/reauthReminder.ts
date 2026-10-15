import { DateTime, Duration } from "luxon";
import { Resend } from "resend";
import { DEVICES_TABLE, PASSKEYS_TABLE } from "../../common";

import SpotifyReauthEmail from "../../../src/emails/SpotifyReauthEmail";
import { getEntireTable } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import { type DatabasePasskey, DeviceKind } from "../../types";
import { refreshTokenSetAtParam } from "./exchange";

const TOKEN_LIFETIME = Duration.fromObject({ months: 6 });
const REMINDER_LEAD = Duration.fromObject({ days: 14 });

const FALLBACK_RECIPIENT = "me@maxrosoff.com";

export const handler = async (): Promise<void> => {
    const [devices, passkeys] = await Promise.all([
        getEntireTable(DEVICES_TABLE),
        getEntireTable(PASSKEYS_TABLE)
    ]);

    const displays = devices
        .filter(({ kind }) => kind === DeviceKind.SPOTIFY)
        .map(({ deviceId }) => ({
            deviceId,
            owners: passkeys.filter((passkey) => passkey.deviceIds?.includes(deviceId))
        }));

    for (const { deviceId, owners } of displays) {
        await remindIfDue(deviceId, owners);
    }
};

async function remindIfDue(deviceId: string, owners: DatabasePasskey[]): Promise<void> {
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
    const recipients = owners.length ? owners : [{ email: FALLBACK_RECIPIENT, name: undefined }];

    const resend = new Resend(await getParameter("/website/resend/api-key"));

    const sent = await Promise.all(
        recipients.map(({ email, name }) =>
            resend.emails.send({
                from: "Spotify Display <display@ice-cream.maxrosoff.com>",
                to: email,
                replyTo: "me@maxrosoff.com",
                subject: "Reconnect Spotify to keep the display running",
                react: SpotifyReauthEmail({
                    name,
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
