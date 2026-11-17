import {
    GetParametersCommand,
    type GetParametersCommandInput,
    PutParameterCommand,
    type PutParameterCommandInput,
    SSMClient
} from "@aws-sdk/client-ssm";
import { faker } from "@faker-js/faker";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach } from "vitest";

import { SIGNING_KEY_PARAMETER } from "../../../api/auth";

export const mockSSMClient = mockClient(SSMClient);

export const mockParameters: Record<string, string> = {
    [SIGNING_KEY_PARAMETER]: "HibgU91NSu5L2GOqV_0itPBjqlX2ua2gtbZ9yP6-h8M",
    "/website/stripe/api-key": `sk_live_${faker.string.alphanumeric(24)}`,
    "/website/stripe/test/api-key": `sk_test_${faker.string.alphanumeric(24)}`,
    "/website/stripe/webhook": `whsec_${faker.string.alphanumeric(24)}`,
    "/website/stripe/subscription-price": `price_${faker.string.alphanumeric(14)}`,
    "/website/resend/api-key": `re_${faker.string.alphanumeric(24)}`,
    "/website/resend/audience": faker.string.uuid(),
    "/website/resend/webhook": `whsec_${faker.string.alphanumeric(24)}`,
    "/website/spotify/client-id": faker.string.alphanumeric(32),
    "/website/spotify/client-secret": faker.string.alphanumeric(32)
};

export const mockParameterStore = new Map<string, string>();

beforeEach(() => {
    for (const [name, value] of Object.entries(mockParameters)) {
        mockParameterStore.set(name, value);
    }
    mockSSMClient
        .on(GetParametersCommand)
        .callsFake(({ Names = [] }: GetParametersCommandInput) => ({
            Parameters: Names.filter((Name) => mockParameterStore.has(Name)).map((Name) => ({
                Name,
                Value: mockParameterStore.get(Name)
            }))
        }));
    mockSSMClient.on(PutParameterCommand).callsFake(({ Name, Value }: PutParameterCommandInput) => {
        mockParameterStore.set(String(Name), String(Value));
        return {};
    });
});

afterEach(() => {
    mockSSMClient.reset();
    mockParameterStore.clear();
});
