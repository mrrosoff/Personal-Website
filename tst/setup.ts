import "aws-sdk-client-mock-jest/vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { afterEach, vi } from "vitest";

import { generateToken } from "../api/auth";
import { LOCAL_ORIGIN } from "../api/common";
import { UserType } from "../api/types";

import "./mocks/aws/dynamodb";
import "./mocks/aws/parameterStore";
import "./mocks/aws/s3";
import "./mocks/resend";
import "./mocks/stripe";
import "./mocks/axios";
import "./mocks/stripeCheckout";
import { mockPasskey } from "./fixtures/aws/dynamodb";

vi.mock("stripe", () => import("./mocks/stripe"));
vi.mock("resend", () => import("./mocks/resend"));
vi.mock("axios", () => import("./mocks/axios"));
vi.mock("@stripe/react-stripe-js/checkout", () => import("./mocks/stripeCheckout"));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(() => Promise.resolve(null)) }));
vi.mock("@aws-sdk/s3-request-presigner", () => import("./mocks/aws/s3"));
vi.mock("../site/components/terminal/games/SnakeGame", () => ({ default: () => null }));

type AwsCommand = new (input: never) => unknown;

type AwsSdkMockMatchers = {
    toHaveReceivedCommand(command: AwsCommand): void;
    toHaveReceivedCommandWith(command: AwsCommand, input: Record<string, unknown>): void;
    toHaveReceivedNthSpecificCommandWith(
        call: number,
        command: AwsCommand,
        input: Record<string, unknown>
    ): void;
};

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
        extends TestingLibraryMatchers<T, R>, AwsSdkMockMatchers {}
}

type MockEventOptions = {
    body?: unknown;
    token?: string;
    local?: boolean;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    isBase64Encoded?: boolean;
};

export function mockEvent(options: MockEventOptions = {}): APIGatewayEvent {
    const { body, token, local, query, headers, isBase64Encoded = false } = options;
    return {
        body:
            body === undefined || typeof body === "string" ? (body ?? null) : JSON.stringify(body),
        headers: {
            ...(token && { authorization: `Bearer ${token}` }),
            ...(local && { origin: LOCAL_ORIGIN }),
            ...headers
        },
        queryStringParameters: query ?? null,
        isBase64Encoded
    } as unknown as APIGatewayEvent;
}

export function responseBody(result: APIGatewayProxyResult) {
    return JSON.parse(result.body) as Record<string, unknown>;
}

export function mockToken(
    userType: UserType,
    options: Omit<Parameters<typeof generateToken>[1], "userType"> = {}
): Promise<string> {
    const id = userType === UserType.ADMIN ? "admin" : mockPasskey.name;
    return generateToken(id, { userType, email: mockPasskey.email, ...options });
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.resetAllMocks();
});
