#!/usr/bin/env ts-node

/*
 * This script generates the keys used to sign and verify JWTs for
 * Project-Cantaloupe. The keys are stored in the jwks/keys.json file.
 * Once used in production, the keys cannot be regenerated, as this
 * would invalidate all existing JWTs.
 *
 * To add a new key, modify the script to import the existing keys,
 * generate a new key, and add it to the key store. Then, write the
 * updated key store to the keys.json file.
 *
 * Once all JWTs that use an old key are expired, the old key can be
 * removed from the key store and the keys.json file.
 *
 * To run the script, use the following command:
 * npm run create-jwt-keys
 *
 */

import { writeFile } from "fs/promises";
import jose from "node-jose";

async function createKeys() {
    const keyStore = jose.JWK.createKeyStore();

    const authenticationKey = await keyStore.generate("EC", "P-256");

    const keyMapping = {
        authentication: authenticationKey.kid
    };
    await writeFile("./api/jwks/keyMapping.json", JSON.stringify(keyMapping, null, 2));

    const keys = keyStore.toJSON(true);
    await writeFile("./api/jwks/keys.json", JSON.stringify(keys, null, 2));
}

void createKeys();
