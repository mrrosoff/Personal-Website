import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithApp } from "../../../../helpers/render";

import MailingListLink from "../../../../../site/components/ice-cream/IceCream/MailingListLink";

describe("MailingListLink", () => {
    it("should link to the mailing list sign up", () => {
        renderWithApp(<MailingListLink />);

        expect(screen.getByText("Join our mailing list").closest("a")).toHaveAttribute(
            "href",
            "/ice-cream/mailing-list"
        );
    });
});
