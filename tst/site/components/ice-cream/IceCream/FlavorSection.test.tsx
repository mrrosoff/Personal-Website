import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";
import { mockFlavor } from "../../../../mocks/aws/dynamodb";

import FlavorSection from "../../../../../site/components/ice-cream/IceCream/FlavorSection";

function renderSection(options: { isLoading?: boolean; selected?: string[] } = {}) {
    const toggleFlavor = vi.fn();
    const result = renderWithApp(
        <FlavorSection
            title={"Current Flavors"}
            description={"Our current rotation."}
            flavors={[mockFlavor, { ...mockFlavor, priceId: "price_gone", name: "Gone", count: 0 }]}
            isLoading={options.isLoading ?? false}
            skeletons={2}
            cart={{ selectedPriceIds: options.selected ?? [], toggleFlavor }}
        />
    );
    return { ...result, toggleFlavor };
}

describe("FlavorSection", () => {
    it("should list the flavors in stock", () => {
        renderSection();

        expect(screen.getByText(mockFlavor.name)).toBeInTheDocument();
        expect(screen.queryByText("Gone")).not.toBeInTheDocument();
    });

    it("should color each flavor's name", () => {
        renderSection();

        expect(screen.getByText(mockFlavor.name)).toHaveStyle({ color: mockFlavor.color });
    });

    it("should add a flavor to the cart on a tap", async () => {
        const { user, toggleFlavor } = renderSection();

        await user.click(screen.getByText(mockFlavor.name));

        expect(toggleFlavor).toHaveBeenCalledWith(mockFlavor.priceId);
    });

    it("should hold space with skeletons while loading", () => {
        renderSection({ isLoading: true });

        expect(screen.queryByText(mockFlavor.name)).not.toBeInTheDocument();
        expect(document.querySelectorAll(".MuiSkeleton-root")).toHaveLength(2);
    });
});
