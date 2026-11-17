import { fromIni, fromNodeProviderChain } from "@aws-sdk/credential-providers";

export const HTTP_SUCCESS = 200;

export const IS_LOCAL_ENVIRONMENT = !process.env.LAMBDA_TASK_ROOT;

const offlineSdkSettings = {
    credentials: async () => {
        try {
            return await fromIni({ profile: "website" })();
        } catch {
            return await fromNodeProviderChain()();
        }
    }
};
export const SDK_SETTINGS = { ...(IS_LOCAL_ENVIRONMENT && offlineSdkSettings) };
