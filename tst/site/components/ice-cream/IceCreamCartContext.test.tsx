import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axiosPost } from "../../../mocks/axios";
import { mockFlavor } from "../../../mocks/aws/dynamodb";

import {
    IceCreamCartProvider,
    useIceCreamCart
} from "../../../../site/components/ice-cream/IceCreamCartContext";

function renderCart() {
    return renderHook(() => useIceCreamCart(), { wrapper: IceCreamCartProvider });
}

describe("IceCreamCartContext", () => {
    it("should load the flavors once", async () => {
        axiosPost.mockResolvedValue({ data: { inventory: [mockFlavor] } });
        const { result } = renderCart();

        await act(() => result.current.loadFlavors());
        await act(() => result.current.loadFlavors());

        expect(result.current.flavors).toEqual([mockFlavor]);
        expect(axiosPost).toHaveBeenCalledOnce();
    });

    it("should report a failed load", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const { result } = renderCart();

        await act(() => result.current.refreshFlavors());

        expect(result.current.flavorsError).toBe("Failed to load flavors. Please try again later.");
        expect(result.current.isLoadingFlavors).toBe(false);
    });

    it("should add and remove flavors from the cart", () => {
        const { result } = renderCart();

        act(() => result.current.toggleFlavor("price_a"));
        act(() => result.current.toggleFlavor("price_b"));
        act(() => result.current.toggleFlavor("price_a"));
        act(() => result.current.toggleFlavor(undefined));

        expect(result.current.selectedPriceIds).toEqual(["price_b"]);
    });

    it("should need a provider", () => {
        expect(() => renderHook(() => useIceCreamCart())).toThrow(
            "useIceCreamCart must be used within IceCreamCartProvider"
        );
    });
});
