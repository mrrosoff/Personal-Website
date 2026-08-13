import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { authenticateHTTPAccessToken, UserType } from "../../auth";
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
    const payload = await authenticateHTTPAccessToken(event);
    const allowedUserTypes = [UserType.ADMIN, UserType.POLAROID_OWNER];
    if (!payload || !allowedUserTypes.includes(payload.userType)) {
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

    const photoExists = await objectExists(POLAROID_PHOTOS_BUCKET, framebufferKey(body.id));
    if (!photoExists) {
        return buildErrorResponse(event, HttpResponseStatus.NOT_FOUND, "No Such Photo");
    }

    await deleteObject(POLAROID_PHOTOS_BUCKET, framebufferKey(body.id));
    await deleteObject(POLAROID_PHOTOS_BUCKET, previewKey(body.id));
    return buildResponse(event, HttpResponseStatus.OK, { removed: true, id: body.id });
};
