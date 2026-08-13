import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { getObject } from "../../aws/services/s3";
import { buildErrorResponse, HttpResponseStatus, POLAROID_PHOTOS_BUCKET } from "../../common";
import { framebufferKey, isPolaroidDevice } from "./photos";

type GetPhotoPayload = {
    id: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!(await isPolaroidDevice(event))) {
        return buildErrorResponse(event, HttpResponseStatus.UNAUTHORIZED, "Device Token Required");
    }

    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: GetPhotoPayload = JSON.parse(event.body);
    if (!body.id) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Photo Id");
    }

    const framebuffer = await getObject(POLAROID_PHOTOS_BUCKET, framebufferKey(body.id));
    if (!framebuffer) {
        return buildErrorResponse(event, HttpResponseStatus.NOT_FOUND, "No Such Photo");
    }

    return buildFramebufferResponse(framebuffer);
};

function buildFramebufferResponse(body: Buffer): APIGatewayProxyResult {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": String(body.length),
            "Cache-Control": "public, max-age=31536000, immutable"
        },
        body: body.toString("base64"),
        isBase64Encoded: true
    };
}
