import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useLoadingDots from "../../../../../../src/components/terminal/admin/common/useLoadingDots";

describe("useLoadingDots", () => {
    it("should count up to three dots and start over", () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useLoadingDots());

        const seen = [result.current];
        for (let i = 0; i < 3; i++) {
            act(() => vi.advanceTimersByTime(500));
            seen.push(result.current);
        }

        expect(seen).toEqual([".", "..", "...", "."]);
        vi.useRealTimers();
    });
});
