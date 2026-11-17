import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { createHash, randomUUID } from "node:crypto";
import { encode as encodePng } from "fast-png";

import { UserType } from "../../auth";
import { putObject } from "../../aws/services/s3";
import {
    HttpResponseStatus,
    MAX_PHOTOS,
    POLAROID_PHOTOS_BUCKET,
    buildErrorResponse,
    buildResponse
} from "../../common";
import { authorize } from "../../permissions";
import { DeviceKind } from "../../types";
import { framebufferKey, listPhotos, previewKey, previewUrl } from "./photos";
import { srgbToLinear } from "./upload/color";
import { applyFilm } from "./upload/film";
import { decodeImage, resizeToCover } from "./upload/image";
import {
    PANEL_HEIGHT,
    PANEL_WIDTH,
    ditherToPalette,
    indicesToRgb,
    packFramebuffer
} from "./upload/ink";

type RenderResult = {
    framebuffer: Buffer;
    preview: Buffer;
    hash: string;
    width: number;
    height: number;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const { device, error } = await authorize(event, UserType.FRIEND, DeviceKind.POLAROID);
    if (!device) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            error ?? "Authentication Required"
        );
    }

    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    if ((await listPhotos(device.deviceId)).length >= MAX_PHOTOS) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            `The Frame Holds ${MAX_PHOTOS.toString()} Photos. Remove One First`
        );
    }

    const source = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");

    let rendered;
    try {
        rendered = renderPhoto(source);
    } catch (err) {
        console.info(err);
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "That Photo Couldn't Be Read"
        );
    }

    const photoId = randomUUID().replace(/-/g, "").slice(0, 12);

    // Framebuffer last: it is the record, so writing it publishes the photo.
    await putObject(
        POLAROID_PHOTOS_BUCKET,
        previewKey(device.deviceId, photoId),
        rendered.preview,
        "image/png"
    );
    await putObject(
        POLAROID_PHOTOS_BUCKET,
        framebufferKey(device.deviceId, photoId),
        rendered.framebuffer,
        "application/octet-stream"
    );

    return buildResponse(event, HttpResponseStatus.OK, {
        id: photoId,
        previewUrl: await previewUrl(device.deviceId, photoId)
    });
};

function renderPhoto(input: Buffer): RenderResult {
    const cropped = resizeToCover(decodeImage(input), PANEL_WIDTH, PANEL_HEIGHT);

    const linear = new Float32Array(PANEL_WIDTH * PANEL_HEIGHT * 3);
    for (let i = 0; i < linear.length; i++) {
        linear[i] = srgbToLinear(cropped.data[i]);
    }

    applyFilm(linear, PANEL_WIDTH, PANEL_HEIGHT);

    const full = ditherToPalette(linear, PANEL_WIDTH, PANEL_HEIGHT);

    const framebuffer = packFramebuffer(full);

    const preview = Buffer.from(
        encodePng({
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            channels: 3,
            depth: 8,
            data: indicesToRgb(full)
        })
    );

    const hash = createHash("sha256").update(framebuffer).digest("hex").slice(0, 8);

    return { framebuffer, preview, hash, width: PANEL_WIDTH, height: PANEL_HEIGHT };
}
