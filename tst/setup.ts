import "aws-sdk-client-mock-jest/vitest";
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import * as additionalMatchers from "jest-extended";
import { afterEach, expect, vi } from "vitest";

import { generateToken } from "../api/auth";
import { LOCAL_ORIGIN } from "../api/common";
import { UserType } from "../api/types";
import Emulator from "../src/javascript-terminal/emulator";
import EmulatorState from "../src/javascript-terminal/emulator-state/EmulatorState";

import "./__mocks__/__aws__/dynamodb";
import "./__mocks__/__aws__/parameterStore";
import "./__mocks__/__aws__/s3";
import "./__mocks__/resend";
import "./__mocks__/stripe";
import "./__mocks__/axios";
import { mockPasskey } from "./__mocks__/__data__/aws/dynamodb";
import { mockFileSystem } from "./__mocks__/__data__/fileSystem";

vi.mock("stripe", () => import("./__mocks__/stripe"));
vi.mock("resend", () => import("./__mocks__/resend"));
vi.mock("axios", () => import("./__mocks__/axios"));
vi.mock("@aws-sdk/s3-request-presigner", () => import("./__mocks__/__aws__/s3"));
vi.mock("../src/components/terminal/games/SnakeGame", () => ({ default: () => null }));

type AwsCommand = new (input: never) => unknown;

interface AwsSdkMockMatchers {
    toHaveReceivedCommand(command: AwsCommand): void;
    toHaveReceivedCommandWith(command: AwsCommand, input: Record<string, unknown>): void;
    toHaveReceivedNthSpecificCommandWith(
        call: number,
        command: AwsCommand,
        input: Record<string, unknown>
    ): void;
}

declare module "@vitest/expect" {
    interface Assertion<T = any> extends CustomMatchers<T>, AwsSdkMockMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers<unknown> {}
}

expect.extend(additionalMatchers);

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
    return JSON.parse(result.body);
}

export function mockToken(
    userType: UserType,
    options: Omit<Parameters<typeof generateToken>[1], "userType"> = {}
): Promise<string> {
    const id = userType === UserType.ADMIN ? "admin" : mockPasskey.name;
    return generateToken(id, { userType, email: mockPasskey.email, ...options });
}

export function mockShell(environmentVariables: Record<string, string> = {}) {
    const emulator = new Emulator();
    const state = EmulatorState.create({
        fs: mockFileSystem(),
        environmentVariables: { cwd: "/", ...environmentVariables }
    });

    function results(command: string) {
        emulator.execute(state, command, "Command Not Found");
        return state.getOutputs().at(-1)?.output ?? [];
    }

    function run(command: string): string {
        return results(command)
            .map((result) => result.output)
            .join("\n");
    }

    return { emulator, state, results, run };
}

afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
});
