import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { UserType } from "../../auth";
import { authorize } from "../../permissions";
import { devicesForIds } from "../devices";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const { token, error } = await authorize(event, UserType.SHARE);
    if (!token) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            error ?? "Invalid Invite Token"
        );
    }

    const devices = await devicesForIds(
        token.userType === UserType.SHARE ? token.deviceIds : undefined
    );

    return buildResponse(event, HttpResponseStatus.OK, {
        deviceKinds: devices.map(({ kind }) => kind)
    });
};
