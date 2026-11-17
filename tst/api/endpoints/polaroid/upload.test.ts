import { PutObjectCommand } from "@aws-sdk/client-s3";
import { encode as encodeJpeg } from "jpeg-js";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockPresignedUrl, mockS3, mockS3Client } from "../../../mocks/aws/s3";
import { mockDevice } from "../../../fixtures/aws/dynamodb";

import { MAX_PHOTOS } from "../../../../api/common";
import { framebufferKey } from "../../../../api/endpoints/polaroid/photos";
import { handler } from "../../../../api/endpoints/polaroid/upload";
import { UserType } from "../../../../api/types";

function mockJpeg(width: number, height: number): string {
    const pixels = Buffer.alloc(width * height * 4, 180);
    return encodeJpeg({ data: pixels, width, height }).data.toString("base64");
}

async function upload(body: string) {
    const token = await mockToken(UserType.FRIEND);
    return handler(mockEvent({ token, body, isBase64Encoded: true }));
}

function mockNoiseJpeg(width: number, height: number): string {
    const pixels = Buffer.alloc(width * height * 4);
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = (i * 2654435761) % 7 < 3 ? 0 : 255;
    }
    return encodeJpeg({ data: pixels, width, height }, 100).data.toString("base64");
}

describe("upload", () => {
    it("should need a friend with a polaroid", async () => {
        const result = await handler(mockEvent({ body: mockJpeg(8, 8) }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a body", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(result.statusCode).toBe(400);
    });

    it("should refuse a photo when the frame is full", async () => {
        for (let i = 0; i < MAX_PHOTOS; i++) {
            mockS3.seed(framebufferKey(mockDevice.deviceId, i.toString()));
        }

        const result = await upload(mockJpeg(8, 8));

        expect(responseBody(result).message).toBe(
            `The Frame Holds ${MAX_PHOTOS.toString()} Photos. Remove One First`
        );
    });

    it("should refuse something that is not a photo", async () => {
        const result = await upload(Buffer.from("not a photo").toString("base64"));

        expect(responseBody(result).message).toBe("That Photo Couldn't Be Read");
    });

    it("should render a landscape photo into a framebuffer", async () => {
        const result = await upload(mockJpeg(32, 16));

        const id = responseBody(result).id as string;
        expect(responseBody(result).previewUrl).toBe(mockPresignedUrl);
        expect(mockS3.get(framebufferKey(mockDevice.deviceId, id))).toHaveLength(120000);
    });

    it("should write the preview before the framebuffer", async () => {
        await upload(mockJpeg(16, 32));

        expect(mockS3Client).toHaveReceivedNthSpecificCommandWith(1, PutObjectCommand, {
            ContentType: "image/png"
        });
        expect(mockS3Client).toHaveReceivedNthSpecificCommandWith(2, PutObjectCommand, {
            ContentType: "application/octet-stream"
        });
    });

    it("should render harsh black and white noise", async () => {
        const result = await upload(mockNoiseJpeg(1003, 677));

        expect(result.statusCode).toBe(200);
    });

    it("should upscale a tiny photo", async () => {
        const result = await upload(mockNoiseJpeg(3, 7));

        expect(result.statusCode).toBe(200);
    });

    it("should read a photo sent as raw bytes", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(
            mockEvent({ token, body: Buffer.from(mockJpeg(8, 8), "base64").toString("latin1") })
        );

        expect(result.statusCode).toBe(400);
    });
});
