import { describe, expect, it } from "vitest";

import { mockEvent } from "../setup";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../api/common";

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
