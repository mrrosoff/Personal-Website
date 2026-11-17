import {
    DeleteObjectCommand,
    type DeleteObjectCommandInput,
    GetObjectCommand,
    type GetObjectCommandInput,
    HeadObjectCommand,
    type HeadObjectCommandInput,
    ListObjectsV2Command,
    type ListObjectsV2CommandInput,
    NoSuchKey,
    PutObjectCommand,
    type PutObjectCommandInput,
    S3Client
} from "@aws-sdk/client-s3";
import { faker } from "@faker-js/faker";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach, vi } from "vitest";

import type { PolaroidFramebufferKey } from "../../../api/types";
import { mockDevice } from "../__data__/aws/dynamodb";

type StoredObject = { body: Buffer; lastModified: Date };

export const mockS3Client = mockClient(S3Client);

export const mockPhotoId = faker.string.alphanumeric(12);
export const mockPhotoKey: PolaroidFramebufferKey = `framebuffer/${mockDevice.deviceId}/${mockPhotoId}.bin`;
export const mockFramebuffer = Buffer.from(faker.string.alphanumeric(64));
export const mockPresignedUrl = faker.internet.url();

export const getSignedUrl = vi.fn();

const objects = new Map<string, StoredObject>();

function stored(key: string | undefined): StoredObject {
    const object = objects.get(key ?? "");
    if (!object) {
        throw new NoSuchKey({ message: `No Object At ${String(key)}`, $metadata: {} });
    }
    return object;
}

export const mockS3 = {
    seed(key: string, body: Buffer = mockFramebuffer) {
        objects.set(key, { body, lastModified: new Date() });
    },
    get(key: string) {
        return objects.get(key)?.body;
    },
    keys() {
        return [...objects.keys()];
    }
};

beforeEach(() => {
    mockS3.seed(mockPhotoKey);
    mockS3Client.on(PutObjectCommand).callsFake(({ Key, Body }: PutObjectCommandInput) => {
        mockS3.seed(String(Key), Body as Buffer);
        return {};
    });
    mockS3Client.on(GetObjectCommand).callsFake(({ Key }: GetObjectCommandInput) => {
        const { body } = stored(Key);
        return { Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(body)) } };
    });
    mockS3Client.on(HeadObjectCommand).callsFake(({ Key }: HeadObjectCommandInput) => {
        stored(Key);
        return {};
    });
    mockS3Client.on(DeleteObjectCommand).callsFake(({ Key }: DeleteObjectCommandInput) => {
        objects.delete(String(Key));
        return {};
    });
    mockS3Client
        .on(ListObjectsV2Command)
        .callsFake(({ Prefix = "" }: ListObjectsV2CommandInput) => ({
            Contents: [...objects.entries()]
                .filter(([key]) => key.startsWith(Prefix))
                .map(([key, { lastModified }]) => ({
                    Key: key,
                    ETag: `"${key}"`,
                    LastModified: lastModified
                }))
        }));
    getSignedUrl.mockResolvedValue(mockPresignedUrl);
});

afterEach(() => {
    objects.clear();
    mockS3Client.reset();
});
