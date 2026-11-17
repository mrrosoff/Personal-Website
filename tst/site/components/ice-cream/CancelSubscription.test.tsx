import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../helpers/render";
import { mockToken } from "../../../setup";
import { AxiosError, axiosPost } from "../../../mocks/axios";

import { UserType } from "../../../../api/types";
import CancelSubscription from "../../../../site/components/ice-cream/CancelSubscription";

const cancelPage = (
    <Routes>
        <Route path="/ice-cream/cancel" element={<CancelSubscription />} />
        <Route path="*" element={null} />
    </Routes>
);

async function renderCancel(token?: string) {
    const link = token ?? (await mockToken(UserType.SUBSCRIBER));
    return renderWithApp(cancelPage, { route: `/ice-cream/cancel?token=${link}` });
}

function apiError(status: number, message?: string) {
    return new AxiosError("failed", String(status), undefined, undefined, {
        status,
        data: message ? { message } : {}
    } as never);
}

describe("CancelSubscription", () => {
    it("should send a visitor without a link home", () => {
        renderWithApp(cancelPage, { route: "/ice-cream/cancel" });

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });

    it("should send someone who is not a subscriber home", async () => {
        await renderCancel(await mockToken(UserType.FRIEND));

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });

    it("should explain what cancelling does", async () => {
        await renderCancel();

        expect(screen.getByText(/stops the monthly charge/)).toBeInTheDocument();
    });

    it("should cancel and offer the way back", async () => {
        const { user } = await renderCancel();

        await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

        expect(screen.getByText(/Your subscription is cancelled/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Back To The Flavors" }));
        expect(screen.getByTestId("location")).toHaveTextContent("/ice-cream");
    });

    it("should send someone with a rejected link home", async () => {
        axiosPost.mockRejectedValue(apiError(401));
        const { user } = await renderCancel();

        await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

        await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/));
    });

    it("should show the API's reason and let them try again", async () => {
        axiosPost.mockRejectedValue(apiError(404, "No Subscription Found"));
        const { user } = await renderCancel();

        await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

        expect(screen.getByText("No Subscription Found")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Try Again" })).toBeEnabled();
    });

    it("should fall back to a general failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        mockSmallScreen();
        const { user } = await renderCancel();

        await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

        expect(
            screen.getByText("That did not go through. Try again in a minute.")
        ).toBeInTheDocument();
    });

    it("should fall back when the API gives no reason", async () => {
        axiosPost.mockRejectedValue(apiError(500));
        const { user } = await renderCancel();

        await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

        expect(
            screen.getByText("That did not go through. Try again in a minute.")
        ).toBeInTheDocument();
    });
});
