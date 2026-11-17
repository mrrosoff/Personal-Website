import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../helpers/render";
import { AxiosError, axiosPost } from "../../__mocks__/axios";

import SpotifyCallback from "../../../src/components/SpotifyCallback";

function renderCallback(search: string) {
    return renderWithApp(<SpotifyCallback />, { route: `/spotify/callback${search}` });
}

describe("SpotifyCallback", () => {
    it("should connect spotify and head home", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        renderCallback("?code=c&state=s");

        expect(screen.getByText("Connecting Spotify...")).toBeInTheDocument();
        expect(await screen.findByText("Spotify Connected")).toBeInTheDocument();
        expect(axiosPost).toHaveBeenCalledWith("https://api.maxrosoff.com/spotify/exchange", {
            code: "c",
            state: "s"
        });

        for (let second = 0; second < 5; second++) {
            await act(() => vi.advanceTimersByTimeAsync(1000));
        }
        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
        vi.useRealTimers();
    });

    it("should say when the user said no", () => {
        renderCallback("?error=access_denied");

        expect(screen.getByText("Authorization Was Denied")).toBeInTheDocument();
        expect(screen.getByText("Redirecting in 5...")).toBeInTheDocument();
    });

    it("should say when details are missing", () => {
        renderCallback("?code=c");

        expect(screen.getByText("Missing Authorization Details")).toBeInTheDocument();
    });

    it("should show the API's reason for failing", async () => {
        axiosPost.mockRejectedValue(
            new AxiosError("bad", "400", undefined, undefined, {
                data: { message: "Invalid or Expired State" }
            } as never)
        );

        renderCallback("?code=c&state=s");

        expect(await screen.findByText("Invalid or Expired State")).toBeInTheDocument();
    });

    it("should fall back to a general failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));

        renderCallback("?code=c&state=s");

        expect(
            await screen.findByText("Could Not Connect Spotify, Please Try Again")
        ).toBeInTheDocument();
    });
});
