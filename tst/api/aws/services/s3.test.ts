import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand
} from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { mockFramebuffer, mockPresignedUrl, mockS3Client } from "../../../__mocks__/__aws__/s3";

import {
    deleteObject,
    getObject,
    listObjects,
    objectExists,
    presignGetObject,
    putObject
} from "../../../../api/aws/services/s3";
import { POLAROID_PHOTOS_BUCKET } from "../../../../api/common";

const key = "framebuffer/device/photo.bin" as const;

describe("s3", () => {
    it("should put an object that caches forever", async () => {
        await putObject(POLAROID_PHOTOS_BUCKET, key, Buffer.from("x"), "application/octet-stream");

        expect(mockS3Client).toHaveReceivedCommandWith(PutObjectCommand, {
            Key: key,
            CacheControl: "public, max-age=31536000, immutable"
        });
    });

    it("should get an object's bytes", async () => {
        const result = await getObject(POLAROID_PHOTOS_BUCKET, key);

        expect(result).toEqual(mockFramebuffer);
    });

    it("should return nothing for a missing object", async () => {
        mockS3Client.on(GetObjectCommand).rejects(new Error("NoSuchKey"));

        const result = await getObject(POLAROID_PHOTOS_BUCKET, key);

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
        const result = await objectExists(POLAROID_PHOTOS_BUCKET, key);

        expect(result).toBeTrue();
    });

    it("should report a missing object", async () => {
        mockS3Client.on(HeadObjectCommand).rejects(new Error("NotFound"));

        const result = await objectExists(POLAROID_PHOTOS_BUCKET, key);

        expect(result).toBeFalse();
    });

    it("should delete an object", async () => {
        await deleteObject(POLAROID_PHOTOS_BUCKET, key);

        expect(mockS3Client).toHaveReceivedCommandWith(DeleteObjectCommand, { Key: key });
    });

    it("should presign a download link", async () => {
        const result = await presignGetObject(POLAROID_PHOTOS_BUCKET, key);

        expect(result).toBe(mockPresignedUrl);
    });
});
