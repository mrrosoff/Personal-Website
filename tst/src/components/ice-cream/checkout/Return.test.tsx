import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../../helpers/render";
import { mockToken } from "../../../../setup";
import { axiosPost } from "../../../../__mocks__/axios";

import { UserType } from "../../../../../api/types";
import Return from "../../../../../src/components/ice-cream/checkout/Return";

const returnPage = (
    <Routes>
        <Route path="/ice-cream/checkout/return" element={<Return />} />
        <Route path="*" element={null} />
    </Routes>
);

function renderReturn(friendToken?: string) {
    return renderWithApp(returnPage, {
        route: "/ice-cream/checkout/return?sessionId=cs_1",
        friendToken
    });
}

describe("Return", () => {
    it("should confirm a paid order and where the receipt went", async () => {
        axiosPost.mockResolvedValue({
            data: { status: "complete", customer_details: { email: "ada@example.com" } }
        });

        renderReturn();

        expect(await screen.findByText("Order Confirmed")).toBeInTheDocument();
        expect(screen.getByText("ada@example.com")).toBeInTheDocument();
        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/ice-cream/checkout-status",
            {
                sessionId: "cs_1"
            }
        );
    });

    it("should fall back to the email the session was opened with", async () => {
        axiosPost.mockResolvedValue({
            data: { status: "complete", customer_email: "b@example.com" }
        });

        renderReturn();

        expect(await screen.findByText("b@example.com")).toBeInTheDocument();
    });

    it("should thank a friend by name without asking stripe", async () => {
        mockSmallScreen();
        const token = await mockToken(UserType.FRIEND);

        renderReturn(token);

        expect(await screen.findByText(/Thanks for dropping by/)).toBeInTheDocument();
        expect(axiosPost).not.toHaveBeenCalled();
    });

    it("should send an unfinished checkout back to the shop", async () => {
        axiosPost.mockResolvedValue({ data: { status: "open" } });

        renderReturn();

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent(/^\/ice-cream$/)
        );
    });

    it("should send a missing session back to the shop", async () => {
        axiosPost.mockRejectedValue(new Error("not found"));

        renderReturn();

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent(/^\/ice-cream$/)
        );
    });

    it("should show nothing for an expired session", async () => {
        axiosPost.mockResolvedValue({ data: { status: "expired" } });

        renderReturn();

        expect(screen.queryByText("Order Confirmed")).not.toBeInTheDocument();
    });
});
