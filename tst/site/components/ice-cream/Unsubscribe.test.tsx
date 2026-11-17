import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockScreenWidth, renderWithApp } from "../../../helpers/render";
import { AxiosError, axiosPost } from "../../../mocks/axios";

import Unsubscribe from "../../../../site/components/ice-cream/Unsubscribe";

async function unsubscribe(user: UserEvent) {
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Remove From Mailing List" }));
}

describe("Unsubscribe", () => {
    it("should need a valid email", () => {
        renderWithApp(<Unsubscribe />);

        expect(screen.getByRole("button", { name: "Remove From Mailing List" })).toBeDisabled();
    });

    it("should remove the email from the list", async () => {
        const { user } = renderWithApp(<Unsubscribe />);

        await unsubscribe(user);

        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/email/unsubscribe", {
            email: "ada@example.com"
        });
        expect(screen.getByTestId("ThumbUpIcon")).toBeInTheDocument();
    });

    it("should show the API's reason for failing", async () => {
        axiosPost.mockRejectedValue(
            new AxiosError("bad", "400", undefined, undefined, {
                data: { message: "Not On The List" }
            } as never)
        );
        const { user } = renderWithApp(<Unsubscribe />);

        await unsubscribe(user);

        expect(screen.getByText("Not On The List")).toBeInTheDocument();
    });

    it("should fall back to a general failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        mockScreenWidth(390);
        const { user } = renderWithApp(<Unsubscribe />);

        await unsubscribe(user);

        expect(screen.getByText("Something Unexpected Happened...")).toBeInTheDocument();
    });
});
