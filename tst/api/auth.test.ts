import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";

import { mockEvent, mockToken } from "../setup";

import {
    authenticateHTTPAccessToken,
    bearerToken,
    decryptToken,
    generateToken,
    UserType
} from "../../api/auth";

describe("generateToken/decryptToken", () => {
    const id = faker.string.uuid();

    it("should encrypt and decrypt a token", async () => {
        const token = await generateToken(id, { userType: UserType.FRIEND });

        const result = await decryptToken(token);

        expect(result).toMatchObject({ id, userType: UserType.FRIEND });
    });

    it("should only include the claims it is given", async () => {
        const token = await generateToken(id, { userType: UserType.SHARE, deviceIds: ["d1"] });

        const result = await decryptToken(token);

        expect(result).not.toHaveProperty("email");
        expect(result).toHaveProperty("deviceIds", ["d1"]);
    });

    it("should reject a tampered token", async () => {
        const token = await generateToken(id, { userType: UserType.FRIEND });

        const result = decryptToken(`${token.slice(0, -4)}AAAA`);

        await expect(result).rejects.toThrow();
    });
});

describe("bearerToken", () => {
    it("should read the token from the Authorization header", () => {
        const result = bearerToken(mockEvent({ token: "abc" }));

        expect(result).toBe("abc");
    });

    it("should accept a capitalized header", () => {
        const result = bearerToken(mockEvent({ headers: { Authorization: "Bearer abc" } }));

        expect(result).toBe("abc");
    });
});

describe("authenticateHTTPAccessToken", () => {
    it("should return nothing if the Authorization header is missing", async () => {
        const result = await authenticateHTTPAccessToken(mockEvent());

        expect(result).toBeEmptyObject();
    });

    it("should return an error if the token is not specified", async () => {
        const event = mockEvent({ headers: { authorization: "Bearer" } });

        const result = await authenticateHTTPAccessToken(event);

        expect(result).toEqual({ error: "Authentication Token Not Specified" });
    });

    it("should return an error if the token is invalid", async () => {
        const result = await authenticateHTTPAccessToken(mockEvent({ token: "junk" }));

        expect(result).toEqual({ error: "Invalid Authentication Token" });
    });

    it("should decode a valid token", async () => {
        const token = await mockToken(UserType.ADMIN);

        const result = await authenticateHTTPAccessToken(mockEvent({ token }));

        expect(result.token?.userType).toBe(UserType.ADMIN);
    });
});
