import type { APIGatewayProxyEvent } from "aws-lambda";
import { createHash } from "node:crypto";
import { IncomingMessage } from "http";

import { bearerToken } from "../auth";
import { getAllItems, getItem, getItemsByIndex, updateItem } from "../aws/services/dynamodb";
import { DEVICES_TABLE } from "../common";
import type { DatabaseDevice, DeviceKind } from "../types";

function hashDeviceSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
}

// A deviceId is the 12 hex characters registerDevice mints, and a secret never
// contains a dot. Matching the whole token means anything else is treated as a
// bare secret rather than being split into a lookup that cannot succeed, so a
// stray JWT costs no read.
const DEVICE_TOKEN_PATTERN = /^([0-9a-f]{12})\.([^.]+)$/;

const LAST_SEEN_RESOLUTION_SECONDS = 300;

export async function resolveDevice(
    req: IncomingMessage | APIGatewayProxyEvent,
    kind: DeviceKind
): Promise<DatabaseDevice | undefined> {
    const token = bearerToken(req);
    if (!token) {
        return undefined;
    }

    const prefixed = DEVICE_TOKEN_PATTERN.exec(token);
    const device = prefixed
        ? await deviceForId(prefixed[1]!, prefixed[2]!)
        : await deviceForBareSecret(token);

    if (!device || device.kind !== kind) {
        return undefined;
    }
    await touchLastSeen(device);
    return device;
}

async function deviceForId(deviceId: string, secret: string): Promise<DatabaseDevice | undefined> {
    const device = await getItem(DEVICES_TABLE, deviceId);
    if (!device) {
        return undefined;
    }
    return device.secretHash === hashDeviceSecret(secret) ? device : undefined;
}

/*
 * For Spotify Display legacy purposes
 */
async function deviceForBareSecret(secret: string): Promise<DatabaseDevice | undefined> {
    return matchDevice(await getAllItems(DEVICES_TABLE), secret);
}

function matchDevice(
    devices: DatabaseDevice[],
    secret: string | undefined
): DatabaseDevice | undefined {
    return secret
        ? devices.find((device) => device.secretHash === hashDeviceSecret(secret))
        : undefined;
}

export async function deviceForOwner(
    email: string | undefined,
    kind: DeviceKind
): Promise<DatabaseDevice | undefined> {
    if (!email) {
        return undefined;
    }
    const devices = await getItemsByIndex(DEVICES_TABLE, "ownerEmail", email);
    return devices.find((device) => device.kind === kind);
}

async function touchLastSeen(device: DatabaseDevice): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    if (now - (device.lastSeenAt ?? 0) < LAST_SEEN_RESOLUTION_SECONDS) {
        return;
    }
    try {
        await updateItem(DEVICES_TABLE, device.deviceId, "lastSeenAt", now);
    } catch (err) {
        // The heartbeat is only for us to see the device is alive, so a failed
        // write shouldn't stop it getting its photo. Log it and carry on.
        console.error(err);
    }
}
