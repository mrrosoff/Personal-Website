import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import {
    mockFramebuffer,
    mockPhotoKey,
    mockPresignedUrl,
    mockS3,
    mockS3Client
} from "../../../mocks/aws/s3";

import {
    deleteObject,
    getObject,
    listObjects,
    objectExists,
    presignGetObject,
    putObject
} from "../../../../api/aws/services/s3";
import { POLAROID_PHOTOS_BUCKET } from "../../../../api/common";

const missingKey = "framebuffer/device/missing.bin" as const;
const newKey = "preview/device/new.png" as const;

describe("s3", () => {
    it("should put an object that caches forever", async () => {
        await putObject(POLAROID_PHOTOS_BUCKET, newKey, Buffer.from("x"), "image/png");

        expect(mockS3.get(newKey)).toEqual(Buffer.from("x"));
        expect(mockS3Client).toHaveReceivedCommandWith(PutObjectCommand, {
            CacheControl: "public, max-age=31536000, immutable"
        });
    });

    it("should get an object's bytes", async () => {
        const result = await getObject(POLAROID_PHOTOS_BUCKET, mockPhotoKey);

        expect(result).toEqual(mockFramebuffer);
    });

    it("should return nothing for a missing object", async () => {
        const result = await getObject(POLAROID_PHOTOS_BUCKET, missingKey);

        expect(result).toBeUndefined();
    });

    it("should page through every object", async () => {
        mockS3Client
            .on(ListObjectsV2Command)
            .resolvesOnce({
                Contents: [{ Key: "a" }],
                IsTruncated: true,
                NextContinuationToken: "t"
            })
            .resolvesOnce({ Contents: [{ Key: "b" }] });

        const result = await listObjects(POLAROID_PHOTOS_BUCKET, "framebuffer/");

        expect(result.map(({ Key }) => Key)).toEqual(["a", "b"]);
    });

    it("should report an object exists", async () => {
        const result = await objectExists(POLAROID_PHOTOS_BUCKET, mockPhotoKey);

        expect(result).toBe(true);
    });

    it("should report a missing object", async () => {
        const result = await objectExists(POLAROID_PHOTOS_BUCKET, missingKey);

        expect(result).toBe(false);
    });

    it("should delete an object", async () => {
        await deleteObject(POLAROID_PHOTOS_BUCKET, mockPhotoKey);

        expect(mockS3.keys()).toHaveLength(0);
    });

    it("should presign a download link", async () => {
        const result = await presignGetObject(POLAROID_PHOTOS_BUCKET, mockPhotoKey);

        expect(result).toBe(mockPresignedUrl);
    });

    it("should treat a listing without contents as empty", async () => {
        mockS3Client.on(ListObjectsV2Command).resolves({});

        const result = await listObjects(POLAROID_PHOTOS_BUCKET, "framebuffer/");

        expect(result).toHaveLength(0);
    });

    it("should list nothing for an empty prefix", async () => {
        const result = await listObjects(POLAROID_PHOTOS_BUCKET, "preview/");

        expect(result).toHaveLength(0);
    });
});
