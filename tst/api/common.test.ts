import { describe, expect, it } from "vitest";

import { mockEvent } from "../setup";

import {
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus,
    shareTokenDurationLabel
} from "../../api/common";

describe("buildResponse", () => {
    it("should allow the site origin", () => {
        const result = buildResponse(mockEvent(), HttpResponseStatus.OK, {});

        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("https://maxrosoff.com");
    });

    it("should allow local development", () => {
        const result = buildResponse(mockEvent({ local: true }), HttpResponseStatus.OK, {});

        expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("http://localhost:3000");
    });

    it("should serialize the body", () => {
        const result = buildResponse(mockEvent(), HttpResponseStatus.OK, { a: 1 });

        expect(result).toMatchObject({ statusCode: 200, body: '{"a":1}' });
    });
});

describe("buildErrorResponse", () => {
    it("should wrap the message", () => {
        const result = buildErrorResponse(mockEvent(), HttpResponseStatus.BAD_REQUEST, "Nope");

        expect(result).toMatchObject({ statusCode: 400, body: '{"message":"Nope"}' });
    });
});

describe("shareTokenDurationLabel", () => {
    it("should count hours", () => {
        expect(shareTokenDurationLabel(1)).toBe("1 Hour");
        expect(shareTokenDurationLabel(6)).toBe("6 Hours");
    });

    it("should count whole days", () => {
        expect(shareTokenDurationLabel(24)).toBe("1 Day");
        expect(shareTokenDurationLabel(168)).toBe("7 Days");
    });
});
