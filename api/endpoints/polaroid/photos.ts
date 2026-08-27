import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { authorizeUserType, UserType } from "../../auth";
import { deviceForOwner, resolveDevice } from "../devices";

import {
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus,
    POLAROID_PHOTOS_BUCKET
} from "../../common";
import { DeviceKind, type PolaroidFramebufferKey, type PolaroidPreviewKey } from "../../types";
import { listObjects, presignGetObject } from "../../aws/services/s3";

export function framebufferKey(deviceId: string, photoId: string): PolaroidFramebufferKey {
    return `framebuffer/${deviceId}/${photoId}.bin`;
}

export function previewKey(deviceId: string, photoId: string): PolaroidPreviewKey {
    return `preview/${deviceId}/${photoId}.png`;
}

export type Photo = {
    photoId: string;
    hash: string;
    uploadedAt: number;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    let device = await resolveDevice(event, DeviceKind.POLAROID);
    if (!device) {
        const { token, error } = await authorizeUserType(event, [UserType.POLAROID_OWNER]);
        if (!token) {
            return buildErrorResponse(
                event,
                HttpResponseStatus.UNAUTHORIZED,
                error ?? "Authentication Required"
            );
        }
        device = await deviceForOwner(token.email, DeviceKind.POLAROID);
    }

    if (!device) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication Required"
        );
    }

    const newestFirst = (await listPhotos(device.deviceId)).reverse();
    const photos = await Promise.all(
        newestFirst.map(async (photo) => ({
            id: photo.photoId,
            hash: photo.hash,
            uploadedAt: photo.uploadedAt,
            previewUrl: await previewUrl(device.deviceId, photo.photoId)
        }))
    );

    return buildResponse(event, HttpResponseStatus.OK, { photos });
};

export async function listPhotos(deviceId: string): Promise<Photo[]> {
    const objects = await listObjects(POLAROID_PHOTOS_BUCKET, `framebuffer/${deviceId}/`);
    return objects
        .flatMap((object) => {
            // Skips S3 console "folder" markers, which would become empty ids.
            const key = object.Key ?? "";
            if (!key.endsWith(".bin")) {
                return [];
            }
            return [
                {
                    photoId: key.slice(key.lastIndexOf("/") + 1, -".bin".length),
                    hash: (object.ETag ?? "").replace(/"/g, "").slice(0, 8),
                    uploadedAt: Math.floor((object.LastModified?.getTime() ?? 0) / 1000)
                }
            ];
        })
        .sort((a, b) => a.uploadedAt - b.uploadedAt);
}

export async function previewUrl(deviceId: string, photoId: string): Promise<string> {
    return presignGetObject(POLAROID_PHOTOS_BUCKET, previewKey(deviceId, photoId));
}
