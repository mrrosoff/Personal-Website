import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockCheckoutApi, renderCheckout } from "../../../../helpers/checkout";
import { mockSmallScreen } from "../../../../helpers/render";
import { mockToken } from "../../../../setup";
import { axiosPost } from "../../../../__mocks__/axios";

import { UserType } from "../../../../../api/types";

beforeEach(mockCheckoutApi);

describe("FriendCheckout", () => {
    it("should give a friend their order for free", async () => {
        mockSmallScreen();
        const token = await mockToken(UserType.FRIEND);
        const { user } = renderCheckout("?priceIds=price_Fig,price_Plum", token);

        expect(await screen.findByText("Plum")).toBeInTheDocument();
        expect(screen.getAllByText("$0.00")).toHaveLength(2);
        await user.type(screen.getByLabelText("Email"), "ada@example.com");
        await user.click(screen.getByRole("button", { name: "Complete Order" }));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/ice-cream/checkout?priceIds=price_Fig,price_Plum",
            { email: "ada@example.com" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(screen.getByTestId("location")).toHaveTextContent("/ice-cream/checkout/return");
    });

    it("should say when a friend's order fails", async () => {
        const { user } = renderCheckout("?priceIds=price_Fig", await mockToken(UserType.FRIEND));
        await screen.findByText("Fig");
        axiosPost.mockRejectedValue(new Error("offline"));

        await user.type(screen.getByLabelText("Email"), "ada@example.com");
        await user.click(screen.getByRole("button", { name: "Complete Order" }));

        expect(await screen.findByText("Checkout Failed")).toBeInTheDocument();
    });
});
