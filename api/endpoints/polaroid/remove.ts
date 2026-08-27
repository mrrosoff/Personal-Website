import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { authorizeUserType, UserType } from "../../auth";
import { deviceForOwner } from "../devices";

import { DeviceKind } from "../../types";
import {
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus,
    POLAROID_PHOTOS_BUCKET
} from "../../common";
import { deleteObject, objectExists } from "../../aws/services/s3";
import { framebufferKey, previewKey } from "./photos";

type RemovePhotoPayload = {
    id: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const { token, error } = await authorizeUserType(event, [UserType.POLAROID_OWNER]);
    if (!token) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            error ?? "Authentication Required"
        );
    }

    const device = await deviceForOwner(token.email, DeviceKind.POLAROID);
    if (!device) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: RemovePhotoPayload = JSON.parse(event.body);
    if (!body.id) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Photo Id");
    }

    const photoExists = await objectExists(
        POLAROID_PHOTOS_BUCKET,
        framebufferKey(device.deviceId, body.id)
    );
    if (!photoExists) {
        return buildErrorResponse(event, HttpResponseStatus.NOT_FOUND, "No Such Photo");
    }

    await deleteObject(POLAROID_PHOTOS_BUCKET, framebufferKey(device.deviceId, body.id));
    await deleteObject(POLAROID_PHOTOS_BUCKET, previewKey(device.deviceId, body.id));
    return buildResponse(event, HttpResponseStatus.OK, { removed: true, id: body.id });
};
