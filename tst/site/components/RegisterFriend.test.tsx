import { browserSupportsWebAuthn, startRegistration, WebAuthnError } from "@simplewebauthn/browser";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../helpers/render";
import { mockToken } from "../../setup";
import { axiosGet, axiosPost } from "../../mocks/axios";

import { DeviceKind, UserType } from "../../../api/types";
import RegisterFriend from "../../../site/components/RegisterFriend";
import type * as SimpleWebAuthn from "@simplewebauthn/browser";

vi.mock("@simplewebauthn/browser", async (importOriginal) => ({
    ...(await importOriginal<typeof SimpleWebAuthn>()),
    browserSupportsWebAuthn: vi.fn(() => true),
    startRegistration: vi.fn()
}));

const registerPage = (
    <Routes>
        <Route path="/register-friend" element={<RegisterFriend />} />
        <Route path="*" element={null} />
    </Routes>
);

async function renderInvite(options: { expiresIn?: number; deviceKinds?: DeviceKind[] } = {}) {
    axiosGet.mockResolvedValue({ data: { deviceKinds: options.deviceKinds ?? [] } });
    const token = await mockToken(UserType.SHARE, { expiresIn: options.expiresIn ?? 3600 });
    const result = renderWithApp(registerPage, { route: `/register-friend?token=${token}` });
    return { ...result, token };
}

async function register(user: Awaited<ReturnType<typeof renderInvite>>["user"]) {
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Register Passkey" }));
}

function webAuthnError(code: string) {
    return new WebAuthnError({ message: "failed", code: code as never, cause: new Error("x") });
}

describe("RegisterFriend", () => {
    it("should send a visitor without an invite home", () => {
        renderWithApp(registerPage, { route: "/register-friend" });

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });

    it("should welcome the friend by name", async () => {
        await renderInvite();

        expect(screen.getByRole("heading")).toHaveTextContent(/^Welcome, /);
        expect(screen.getByRole("button", { name: "Register Passkey" })).toBeDisabled();
    });

    it("should say when the invite has expired", async () => {
        await renderInvite({ expiresIn: -10 });

        expect(
            screen.getByText("This invite link has expired. Ask for a new one.")
        ).toBeInTheDocument();
    });

    it("should list the devices the friend was added to", async () => {
        await renderInvite({ deviceKinds: [DeviceKind.POLAROID, DeviceKind.SPOTIFY] });

        expect(await screen.findByText(/a Polaroid device & a Spotify device/)).toHaveTextContent(
            "Your photos go up at /polaroid"
        );
    });

    it("should not mention photos without a polaroid", async () => {
        await renderInvite({ deviceKinds: [DeviceKind.SPOTIFY] });

        expect(await screen.findByText(/a Spotify device/)).not.toHaveTextContent("photos");
    });

    it("should carry on when devices fail to load", async () => {
        axiosGet.mockRejectedValue(new Error("offline"));
        const token = await mockToken(UserType.SHARE);

        renderWithApp(registerPage, { route: `/register-friend?token=${token}` });

        expect(await screen.findByText(/Register a passkey/)).toBeInTheDocument();
    });

    it("should explain a browser without passkeys", async () => {
        vi.mocked(browserSupportsWebAuthn).mockReturnValue(false);
        const { user } = await renderInvite();

        await register(user);

        expect(
            screen.getByText("This Browser / Device Doesn't Support Biometric Passkeys.")
        ).toBeInTheDocument();
    });

    it("should register and go to the polaroid when that is all they have", async () => {
        axiosPost.mockResolvedValue({ data: { challenge: "challenge" } });
        vi.mocked(startRegistration).mockResolvedValue({ id: "credential" } as never);
        const { user, token } = await renderInvite({ deviceKinds: [DeviceKind.POLAROID] });
        await screen.findByText(/a Polaroid device/);

        await register(user);

        expect(axiosPost).toHaveBeenLastCalledWith(
            "https://api.maxrosoff.com/friends/passkey-register",
            { challenge: "challenge", response: { id: "credential" }, email: "ada@example.com" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(screen.getByTestId("location")).toHaveTextContent("/polaroid");
    });

    it("should register and go home otherwise", async () => {
        vi.mocked(startRegistration).mockResolvedValue({ id: "credential" } as never);
        const { user } = await renderInvite();

        await register(user);

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });

    it.each([
        [
            "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
            "This Device Doesn't Support Biometric Passkeys"
        ],
        [
            "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
            "A Passkey Is Already Registered With This Device"
        ],
        ["ERROR_CEREMONY_ABORTED", "Registration Cancelled. Try Again"],
        ["ERROR_INVALID_DOMAIN", "Registration Failed. Ask For A New Link."]
    ])("should explain %s", async (code, message) => {
        vi.mocked(startRegistration).mockRejectedValue(webAuthnError(code));
        const { user } = await renderInvite();

        await register(user);

        expect(await screen.findByText(message)).toBeInTheDocument();
    });

    it("should explain any other failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const { user } = await renderInvite();

        await register(user);

        expect(
            await screen.findByText("Registration Failed. Ask For A New Link.")
        ).toBeInTheDocument();
    });
});
