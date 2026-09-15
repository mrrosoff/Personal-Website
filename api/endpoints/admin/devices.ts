import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getEntireTable } from "../../aws/services/dynamodb";
import { isAdmin } from "../../permissions";
import {
    DEVICES_TABLE,
    PASSKEYS_TABLE,
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus
} from "../../common";
import { DeviceKind } from "../../types";

const KIND_LABELS: Record<DeviceKind, string> = {
    [DeviceKind.POLAROID]: "Polaroid",
    [DeviceKind.SPOTIFY]: "Spotify Display"
};

const listOwners = (owners: string[]): string =>
    owners.length < 2
        ? owners[0]!
        : `${owners.slice(0, -1).join(", ")} & ${owners[owners.length - 1]}`;

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!(await isAdmin(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    const [devices, passkeys] = await Promise.all([
        getEntireTable(DEVICES_TABLE),
        getEntireTable(PASSKEYS_TABLE)
    ]);

    const named = devices.map(({ deviceId, kind }) => {
        const owners = passkeys
            .filter((passkey) => passkey.deviceIds?.includes(deviceId))
            .map((passkey) => passkey.name)
            .sort();
        return {
            deviceId,
            kind,
            name: owners.length
                ? `${listOwners(owners)}'s ${KIND_LABELS[kind]}`
                : `Unclaimed ${KIND_LABELS[kind]}`
        };
    });

    return buildResponse(event, HttpResponseStatus.OK, {
        devices: named.sort((a, b) => a.name.localeCompare(b.name))
    });
};
