import type { Page } from "@playwright/test";

export async function fakePasskeys(page: Page) {
    await page.addInitScript(() => {
        const buffer = (text: string) => new TextEncoder().encode(text).buffer;
        const credential = (response: object) => ({
            id: "ZmFrZS1jcmVkZW50aWFs",
            rawId: buffer("fake-credential"),
            type: "public-key",
            authenticatorAttachment: "platform",
            response,
            getClientExtensionResults: () => ({})
        });

        Object.defineProperty(CredentialsContainer.prototype, "get", {
            value: () =>
                Promise.resolve(
                    credential({
                        authenticatorData: buffer("authenticator"),
                        clientDataJSON: buffer("client"),
                        signature: buffer("signature"),
                        userHandle: buffer("user")
                    })
                )
        });
        Object.defineProperty(CredentialsContainer.prototype, "create", {
            value: () =>
                Promise.resolve(
                    credential({
                        attestationObject: buffer("attestation"),
                        clientDataJSON: buffer("client"),
                        getTransports: () => ["internal"],
                        getPublicKeyAlgorithm: () => -7,
                        getPublicKey: () => buffer("public-key"),
                        getAuthenticatorData: () => buffer("authenticator")
                    })
                )
        });
    });
}

export const PASSKEY_AUTH_OPTIONS = {
    challenge: "Y2hhbGxlbmdl",
    rpId: "localhost",
    allowCredentials: [],
    userVerification: "preferred"
};

export const PASSKEY_REGISTER_OPTIONS = {
    challenge: "Y2hhbGxlbmdl",
    rp: { id: "localhost", name: "Max Rosoff" },
    user: { id: "dXNlcg", name: "ada", displayName: "Ada" },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    excludeCredentials: [],
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" }
};
