import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";

import { SDK_SETTINGS } from "../common";

const ssmClient = new SSMClient(SDK_SETTINGS);

type MappedStringRecord<T extends string[]> = Record<T[number], string>;

export async function getParameter(parameter: string): Promise<string> {
    const parameterMap = await getParameters(parameter);
    return parameterMap[parameter];
}

export async function getParameters<T extends string[]>(
    ...parameters: T
): Promise<MappedStringRecord<T>> {

    const getParametersRequest = new GetParametersCommand({
        Names: parameters,
        WithDecryption: true
    });
    const output = await ssmClient.send(getParametersRequest);
    if (!output.Parameters) {
        throw new Error("Something Unexpected Happened");
    }
    return Object.fromEntries(
        output.Parameters.map((param) => [param.Name, param.Value])
    ) as MappedStringRecord<T>;
}
