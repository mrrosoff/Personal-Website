import { GetParametersCommand, PutParameterCommand } from "@aws-sdk/client-ssm";
import { describe, expect, it } from "vitest";

import { mockParameters, mockSSMClient } from "../../../mocks/aws/parameterStore";

import {
    getParameter,
    getParameters,
    putSecureParameter
} from "../../../../api/aws/services/parameterStore";

describe("parameterStore", () => {
    it("should get a single parameter", async () => {
        const result = await getParameter("/website/resend/api-key");

        expect(result).toBe(mockParameters["/website/resend/api-key"]);
    });

    it("should get several parameters by name", async () => {
        const result = await getParameters("/website/resend/api-key", "/website/resend/audience");

        expect(result).toEqual({
            "/website/resend/api-key": mockParameters["/website/resend/api-key"],
            "/website/resend/audience": mockParameters["/website/resend/audience"]
        });
    });

    it("should decrypt parameters", async () => {
        await getParameter("/website/resend/api-key");

        expect(mockSSMClient).toHaveReceivedCommandWith(GetParametersCommand, {
            WithDecryption: true
        });
    });

    it("should throw if the response has no parameters", async () => {
        mockSSMClient.on(GetParametersCommand).resolves({});

        const result = getParameter("/website/resend/api-key");

        await expect(result).rejects.toThrow("Something Unexpected Happened");
    });

    it("should store a secure parameter", async () => {
        await putSecureParameter("/website/test", "value");

        expect(mockSSMClient).toHaveReceivedCommandWith(PutParameterCommand, {
            Name: "/website/test",
            Value: "value",
            Type: "SecureString",
            Overwrite: true
        });
    });
});
