import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axiosPost } from "../../../__mocks__/axios";
import { mockFlavor } from "../../../__mocks__/__data__/aws/dynamodb";

import {
    IceCreamCartProvider,
    useIceCreamCart
} from "../../../../src/components/ice-cream/IceCreamCartContext";

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
        expect(result.current.isLoadingFlavors).toBeFalse();
    });

    it("should not refresh twice at once", async () => {
        let finish: (value: unknown) => void = () => undefined;
        axiosPost.mockReturnValue(new Promise((resolve) => (finish = resolve)));
        const { result } = renderCart();

        act(() => void result.current.refreshFlavors());
        await waitFor(() => expect(result.current.isLoadingFlavors).toBeTrue());
        await act(() => result.current.refreshFlavors());
        await act(async () => finish({ data: { inventory: [] } }));

        expect(axiosPost).toHaveBeenCalledOnce();
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
