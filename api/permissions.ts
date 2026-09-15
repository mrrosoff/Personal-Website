import type { APIGatewayProxyEvent } from "aws-lambda";
import { IncomingMessage } from "http";

import { type AccessToken, authenticateHTTPAccessToken, UserType } from "./auth";
import { deviceForOwner } from "./endpoints/devices";
import type { DatabaseDevice, DeviceKind } from "./types";

export async function isAdmin(req: IncomingMessage | APIGatewayProxyEvent): Promise<boolean> {
    const { token } = await authenticateHTTPAccessToken(req);
    return token?.userType === UserType.ADMIN;
}

export async function authorize(
    req: IncomingMessage | APIGatewayProxyEvent,
    allowed: UserType,
    kind?: DeviceKind
): Promise<{ token?: AccessToken; device?: DatabaseDevice; error?: string }> {
    const { token, error } = await authenticateHTTPAccessToken(req);
    if (error) {
        return { error };
    }
    if (!token || ![allowed, UserType.ADMIN].includes(token.userType)) {
        return {};
    }

    return kind ? { token, device: await deviceForOwner(token.email, kind) } : { token };
}
