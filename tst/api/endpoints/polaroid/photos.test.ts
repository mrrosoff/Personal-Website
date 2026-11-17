import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockPhotoId, mockPresignedUrl, mockS3Client } from "../../../__mocks__/__aws__/s3";
import { mockDevice, mockDeviceToken } from "../../../__mocks__/__data__/aws/dynamodb";

import {
    framebufferKey,
    handler,
    listPhotos,
    previewKey
} from "../../../../api/endpoints/polaroid/photos";
import { UserType } from "../../../../api/types";

describe("photos", () => {
    it("should need a device or a friend", async () => {
        const result = await handler(mockEvent());

        expect(result.statusCode).toBe(401);
    });

    it("should list the photos for the frame", async () => {
        const result = await handler(mockEvent({ token: mockDeviceToken }));

        expect(responseBody(result).photos).toEqual([
            expect.objectContaining({ id: mockPhotoId, previewUrl: mockPresignedUrl })
        ]);
    });

    it("should list the photos for the friend who owns the frame", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(responseBody(result).photos).toHaveLength(1);
    });
});

describe("listPhotos", () => {
    it("should sort oldest first and skip folder markers", async () => {
        mockS3Client.on(ListObjectsV2Command).resolves({
            Contents: [
                {
                    Key: "framebuffer/d/new.bin",
                    ETag: '"abcdef1234"',
                    LastModified: new Date(2000)
                },
                { Key: "framebuffer/d/" },
                { Key: "framebuffer/d/old.bin", LastModified: new Date(1000) }
            ]
        });

        const result = await listPhotos(mockDevice.deviceId);

        expect(result).toEqual([
            { photoId: "old", hash: "", uploadedAt: 1 },
            { photoId: "new", hash: "abcdef12", uploadedAt: 2 }
        ]);
    });
});

describe("keys", () => {
    it("should keep framebuffers and previews per device", () => {
        expect(framebufferKey("d", "p")).toBe("framebuffer/d/p.bin");
        expect(previewKey("d", "p")).toBe("preview/d/p.png");
    });

    it("should skip an object without a key", async () => {
        mockS3Client.on(ListObjectsV2Command).resolves({ Contents: [{}] });

        const result = await listPhotos(mockDevice.deviceId);

        expect(result).toBeEmpty();
    });
});
