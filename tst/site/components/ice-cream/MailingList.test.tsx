import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockSmallScreen, renderWithApp } from "../../../helpers/render";
import { AxiosError, axiosPost } from "../../../mocks/axios";

import MailingList, {
    registerMailingListUser
} from "../../../../site/components/ice-cream/MailingList";

async function signUp(user: ReturnType<typeof renderWithApp>["user"]) {
    await user.type(screen.getByLabelText("First Name"), "Ada");
    await user.type(screen.getByLabelText("Last Name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
}

describe("registerMailingListUser", () => {
    it("should trim the details and leave out blank names", async () => {
        axiosPost.mockResolvedValue({ data: { userId: "u1" } });

        await registerMailingListUser({
            firstName: "  ",
            email: " ada@example.com "
        });

        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/email/register", {
            firstName: undefined,
            lastName: undefined,
            email: "ada@example.com"
        });
    });
});

describe("MailingList", () => {
    it("should wait for every field before signing up", async () => {
        const { user } = renderWithApp(<MailingList />);

        await user.type(screen.getByLabelText("First Name"), "Ada");

        expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
    });

    it("should sign up and thank the visitor", async () => {
        const { user } = renderWithApp(<MailingList />);

        await signUp(user);

        expect(screen.getByTestId("ThumbUpIcon")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign Up" })).toBeDisabled();
    });

    it("should show the API's reason for failing", async () => {
        axiosPost.mockRejectedValue(
            new AxiosError("bad", "400", undefined, undefined, {
                data: { message: "Already Signed Up" }
            } as never)
        );
        const { user } = renderWithApp(<MailingList />);

        await signUp(user);

        expect(screen.getByText("Already Signed Up")).toBeInTheDocument();
    });

    it("should fall back to a general failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        mockSmallScreen();
        const { user } = renderWithApp(<MailingList />);

        await signUp(user);

        expect(screen.getByText("Something Unexpected Happened...")).toBeInTheDocument();
    });
});
