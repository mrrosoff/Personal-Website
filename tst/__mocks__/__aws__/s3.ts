import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { faker } from "@faker-js/faker";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach, vi } from "vitest";

import { mockDevice } from "../__data__/aws/dynamodb";

export const mockS3Client = mockClient(S3Client);

export const mockPhotoId = faker.string.alphanumeric(12);
export const mockFramebuffer = Buffer.from(faker.string.alphanumeric(64));
export const mockPresignedUrl = faker.internet.url();

export const getSignedUrl = vi.fn();

beforeEach(() => {
    mockS3Client.on(ListObjectsV2Command).resolves({
        Contents: [
            {
                Key: `framebuffer/${mockDevice.deviceId}/${mockPhotoId}.bin`,
                ETag: `"${faker.string.hexadecimal({ length: 32, prefix: "" })}"`,
                LastModified: faker.date.recent()
            }
        ]
    });
    mockS3Client.on(GetObjectCommand).resolves({
        Body: { transformToByteArray: async () => new Uint8Array(mockFramebuffer) } as never
    });
    mockS3Client.on(HeadObjectCommand).resolves({});
    mockS3Client.on(PutObjectCommand).resolves({});
    mockS3Client.on(DeleteObjectCommand).resolves({});
    getSignedUrl.mockResolvedValue(mockPresignedUrl);
});

afterEach(() => {
    mockS3Client.reset();
});
