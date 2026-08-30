import type { APIGatewayProxyEvent } from "aws-lambda";
import { createHash } from "node:crypto";
import { IncomingMessage } from "http";

import { bearerToken } from "../auth";
import { getAllItems, getItem, updateItem } from "../aws/services/dynamodb";
import { DEVICES_TABLE } from "../common";
import type { DatabaseDevice, DeviceKind } from "../types";

function hashDeviceSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
}

// A deviceId is 12 hex characters and a secret never contains a dot, so
// matching the whole token keeps a stray JWT from costing a read.
const DEVICE_TOKEN_PATTERN = /^([0-9a-f]{12})\.([^.]+)$/;

const LAST_SEEN_RESOLUTION_SECONDS = 300;

export async function resolveDevice(
    req: IncomingMessage | APIGatewayProxyEvent,
    kind: DeviceKind
): Promise<DatabaseDevice | undefined> {
    const prefixed = DEVICE_TOKEN_PATTERN.exec(bearerToken(req) ?? "");
    if (!prefixed) {
        return undefined;
    }

    const device = await deviceForId(prefixed[1]!, prefixed[2]!);
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

export async function deviceForOwner(
    email: string | undefined,
    kind: DeviceKind
): Promise<DatabaseDevice | undefined> {
    if (!email) {
        return undefined;
    }
    // A device can have several owners, which a partition key cannot express,
    // so this reads the table. It runs on page load, not on a device poll.
    const devices = await getAllItems(DEVICES_TABLE);
    return devices.find((device) => device.kind === kind && device.ownerEmails.includes(email));
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
