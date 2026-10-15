#!/usr/bin/env ts-node

/*
 * This script generates the key used to sign and verify JWTs for the
 * website API. The public half is written to api/jwks/keys.json and its id
 * to api/jwks/keyMapping.json, both safe to commit. Only the private scalar
 * (the JWK "d") is stored, in the SSM SecureString /website/jwt/signing-key.
 *
 * Running this rotates the key: every token signed with the old key
 * (admin sessions, friend invites, cancel links) stops verifying once the
 * new keys.json and keyMapping.json are deployed.
 *
 * To run the script, use the following command:
 * npm run create-jwt-keys
 *
 */

import { writeFile } from "fs/promises";
import jose from "node-jose";

import { SIGNING_KEY_PARAMETER } from "../api/auth";
import { putSecureParameter } from "../api/aws/services/parameterStore";

async function createKeys() {
    const keyStore = jose.JWK.createKeyStore();

    const authenticationKey = await keyStore.generate("EC", "P-256");

    const { d } = authenticationKey.toJSON(true) as { d: string };
    await putSecureParameter(SIGNING_KEY_PARAMETER, d);
    await writeFile("./api/jwks/keys.json", JSON.stringify(keyStore.toJSON(), null, 4) + "\n");

    const keyMapping = {
        authentication: authenticationKey.kid
    };
    await writeFile("./api/jwks/keyMapping.json", JSON.stringify(keyMapping, null, 4) + "\n");
}

void createKeys();
