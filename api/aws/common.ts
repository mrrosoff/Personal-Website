import { fromSSO } from "@aws-sdk/credential-providers";

export const HTTP_SUCCESS = 200;
export const HTTP_REDIRECT = 301;
export const HTTP_SERVER_BAD_REQUEST = 400;
export const HTTP_SERVER_NOT_FOUND = 404;
export const HTTP_SERVER_ERROR = 500;

export const IS_LOCAL_ENVIRONMENT = !process.env.LAMBDA_TASK_ROOT;

const offlineSdkSettings = { credentials: fromSSO({ profile: "website" }) };
export const SDK_SETTINGS = { ...(IS_LOCAL_ENVIRONMENT && offlineSdkSettings) };
