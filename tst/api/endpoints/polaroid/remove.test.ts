import { describe, expect, it } from "vitest";

import { mockEvent, mockToken, responseBody } from "../../../setup";
import { mockPhotoId, mockS3 } from "../../../__mocks__/__aws__/s3";
import { mockDevice } from "../../../__mocks__/__data__/aws/dynamodb";

import { handler } from "../../../../api/endpoints/polaroid/remove";
import { UserType } from "../../../../api/types";

describe("remove", () => {
    it("should need a friend with a polaroid", async () => {
        const result = await handler(mockEvent({ body: { id: "p" } }));

        expect(result.statusCode).toBe(401);
    });

    it("should need a body", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token }));

        expect(result.statusCode).toBe(400);
    });

    it("should need a photo id", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: {} }));

        expect(responseBody(result).message).toBe("Missing Photo Id");
    });

    it("should 404 a missing photo", async () => {
        const token = await mockToken(UserType.FRIEND);

        const result = await handler(mockEvent({ token, body: { id: "missing" } }));

        expect(result.statusCode).toBe(404);
    });

    it("should delete the framebuffer and preview", async () => {
        const token = await mockToken(UserType.FRIEND);

        mockS3.seed(`preview/${mockDevice.deviceId}/${mockPhotoId}.png`);

        const result = await handler(mockEvent({ token, body: { id: mockPhotoId } }));

        expect(responseBody(result)).toEqual({ removed: true, id: mockPhotoId });
        expect(mockS3.keys()).toHaveLength(0);
    });
});
