import type { _Object } from "@aws-sdk/client-s3";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { POLAROID_PHOTOS_BUCKET } from "../../common";
import type { PolaroidObjectKey } from "../../types";
import { SDK_SETTINGS } from "../common";

export type Bucket = typeof POLAROID_PHOTOS_BUCKET;

// prettier-ignore
export type ObjectKey<T extends Bucket> =
    T extends typeof POLAROID_PHOTOS_BUCKET ? PolaroidObjectKey :
    never;

const s3Client = new S3Client(SDK_SETTINGS);

export async function putObject<T extends Bucket>(
    bucket: T,
    key: ObjectKey<T>,
    body: Buffer,
    contentType: string
): Promise<void> {
    console.debug(`Putting ${key} into ${bucket}`);
    const putObjectRequest = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable"
    });
    await s3Client.send(putObjectRequest);
}

export async function getObject<T extends Bucket>(
    bucket: T,
    key: ObjectKey<T>
): Promise<Buffer | undefined> {
    console.debug(`Getting ${key} from ${bucket}`);
    try {
        const getObjectRequest = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });
        const output = await s3Client.send(getObjectRequest);
        const bytes = await output.Body?.transformToByteArray();
        return bytes && Buffer.from(bytes);
    } catch (err) {
        console.info(err);
        return undefined;
    }
}

export async function listObjects<T extends Bucket>(bucket: T, prefix: string): Promise<_Object[]> {
    console.debug(`Listing ${prefix} in ${bucket}`);
    const objects: _Object[] = [];
    let continuationToken: string | undefined;

    do {
        const output = await s3Client.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken
            })
        );
        objects.push(...(output.Contents ?? []));
        continuationToken = output.IsTruncated ? output.NextContinuationToken : undefined;
    } while (continuationToken);

    return objects;
}

export async function objectExists<T extends Bucket>(
    bucket: T,
    key: ObjectKey<T>
): Promise<boolean> {
    try {
        await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return true;
    } catch {
        return false;
    }
}

export async function deleteObject<T extends Bucket>(bucket: T, key: ObjectKey<T>): Promise<void> {
    console.debug(`Deleting ${key} from ${bucket}`);
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function presignGetObject<T extends Bucket>(
    bucket: T,
    key: ObjectKey<T>,
    expiresIn = 3600
): Promise<string> {
    return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
        expiresIn
    });
}
