import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import jose from "node-jose";

import { HTTP_SUCCESS } from "../aws/common";
import keys from "./keys.json";

async function jwksHandler(_req: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    console.debug("Generating JWKS Response");
    const keyStore = await jose.JWK.asKeyStore(keys);
    return {
        statusCode: HTTP_SUCCESS,
        body: JSON.stringify(keyStore.toJSON())
    };
}

export const handler = jwksHandler;
