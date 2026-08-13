import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getParameter } from "../../aws/services/parameterStore";
import { authenticateHTTPAccessToken, isDevice, UserType } from "../../auth";
import {
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus,
    POLAROID_PHOTOS_BUCKET
} from "../../common";
import type { PolaroidObjectKey } from "../../types";
import { listObjects, presignGetObject } from "../../aws/services/s3";

export function framebufferKey(photoId: string): PolaroidObjectKey {
    return `framebuffer/${photoId}.bin`;
}

export function previewKey(photoId: string): PolaroidObjectKey {
    return `preview/${photoId}.png`;
}

export const DEVICE_SECRET_PARAMETER = "/website/polaroid/device-secret";

export type Photo = {
    photoId: string;
    hash: string;
    uploadedAt: number;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!(await isAuthorized(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    const newestFirst = (await listPhotos()).reverse();
    const photos = await Promise.all(
        newestFirst.map(async (photo) => ({
            id: photo.photoId,
            hash: photo.hash,
            uploadedAt: photo.uploadedAt,
            previewUrl: await previewUrl(photo.photoId)
        }))
    );

    return buildResponse(event, HttpResponseStatus.OK, { photos });
};

async function isAuthorized(event: APIGatewayEvent): Promise<boolean> {
    if (await isPolaroidDevice(event)) {
        return true;
    }
    const payload = await authenticateHTTPAccessToken(event);
    const allowedUserTypes = [UserType.ADMIN, UserType.POLAROID_OWNER];
    return payload !== null && allowedUserTypes.includes(payload.userType);
}

export async function isPolaroidDevice(event: APIGatewayEvent): Promise<boolean> {
    return isDevice(event, await getParameter(DEVICE_SECRET_PARAMETER));
}

export async function listPhotos(): Promise<Photo[]> {
    const objects = await listObjects(POLAROID_PHOTOS_BUCKET, "framebuffer/");
    return objects
        .flatMap((object) => {
            // Skips S3 console "folder" markers, which would become empty ids.
            const key = object.Key ?? "";
            if (!key.endsWith(".bin")) {
                return [];
            }
            return [
                {
                    photoId: key.replace(/^framebuffer\/|\.bin$/g, ""),
                    hash: (object.ETag ?? "").replace(/"/g, "").slice(0, 8),
                    uploadedAt: Math.floor((object.LastModified?.getTime() ?? 0) / 1000)
                }
            ];
        })
        .sort((a, b) => a.uploadedAt - b.uploadedAt);
}

export async function previewUrl(photoId: string): Promise<string> {
    return presignGetObject(POLAROID_PHOTOS_BUCKET, previewKey(photoId));
}
