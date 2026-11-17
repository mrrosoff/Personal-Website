import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockScreenWidth, renderWithApp } from "../../../helpers/render";
import { mockEmulatorState } from "../../../helpers/terminal";
import { mockToken } from "../../../setup";
import { AxiosError, axiosGet, axiosPost } from "../../../mocks/axios";

import { DeviceKind, UserType } from "../../../../api/types";
import Polaroid from "../../../../site/components/polaroid/Polaroid";
import { signInWithPasskey } from "../../../../site/javascript-terminal/commands/sudo";
import type * as Sudo from "../../../../site/javascript-terminal/commands/sudo";

vi.mock("../../../../site/javascript-terminal/commands/sudo", async (importOriginal) => ({
    ...(await importOriginal<typeof Sudo>()),
    signInWithPasskey: vi.fn()
}));
vi.mock("../../../../site/components/polaroid/CropDialog", () => ({
    default: (props: {
        file: File | null;
        remaining: number;
        onCancel: () => void;
        onConfirm: (cropped: Blob) => void;
    }) =>
        props.file && (
            <div>
                <p>{`cropping ${props.file.name}, ${props.remaining.toString()} more`}</p>
                <button onClick={() => props.onConfirm(new Blob(["jpeg"]))}>{"add"}</button>
                <button onClick={props.onCancel}>{"skip"}</button>
            </div>
        )
}));

const photos = [{ id: "p1", uploadedAt: 1, previewUrl: "https://example.com/p1.png" }];

function polaroidToken() {
    return mockToken(UserType.FRIEND, { deviceKinds: [DeviceKind.POLAROID] });
}

function renderPolaroid(environmentVariables: Record<string, string> = {}) {
    return renderWithApp(
        <Routes>
            <Route path="/polaroid" element={<Polaroid />} />
            <Route path="*" element={null} />
        </Routes>,
        { route: "/polaroid", emulatorState: mockEmulatorState(environmentVariables) }
    );
}

async function renderSignedIn() {
    const token = await polaroidToken();
    const result = renderPolaroid({ AUTH_TOKEN: token });
    await screen.findByText("Polaroid");
    return { ...result, token };
}

function photo(name: string, type = "image/jpeg") {
    return new File(["x"], name, { type });
}

function choose(...files: File[]) {
    fireEvent.change(screen.getByLabelText("Choose Photos"), { target: { files } });
}

beforeEach(() => {
    axiosGet.mockResolvedValue({ data: { photos } });
});

describe("Polaroid", () => {
    it("should open the frame once the friend signs in", async () => {
        vi.mocked(signInWithPasskey).mockResolvedValue(await polaroidToken());
        const { user } = renderPolaroid();

        await user.click(screen.getByText("Unlock"));

        expect(await screen.findByText("Polaroid")).toBeInTheDocument();
    });

    it("should send someone without a polaroid home", async () => {
        renderPolaroid({ AUTH_TOKEN: await mockToken(UserType.FRIEND) });

        expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });

    it("should load the frame's photos", async () => {
        const { token } = await renderSignedIn();

        await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(1));
        expect(axiosGet).toHaveBeenCalledWith("https://api.maxrosoff.com/polaroid/photos", {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(screen.getByText(/Can't wait\?/)).toBeInTheDocument();
    });

    it("should check for new photos while the page is open", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        await renderSignedIn();

        await act(() => vi.advanceTimersByTimeAsync(30_000));

        expect(axiosGet).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });

    it("should stop checking while the page is hidden", async () => {
        await renderSignedIn();
        vi.spyOn(document, "hidden", "get").mockReturnValue(true);

        act(() => void document.dispatchEvent(new Event("visibilitychange")));

        expect(axiosGet).toHaveBeenCalledOnce();
    });

    it("should say when photos fail to load", async () => {
        axiosGet.mockRejectedValue(new Error("offline"));

        await renderSignedIn();

        expect(await screen.findByText("Couldn't load your photos.")).toBeInTheDocument();
    });

    it("should crop and upload chosen photos one at a time", async () => {
        const { user, token } = await renderSignedIn();

        choose(photo("a.jpg"), photo("b.heic", ""));
        expect(screen.getByText("cropping a.jpg, 1 more")).toBeInTheDocument();
        await user.click(screen.getByText("add"));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/polaroid/upload",
            expect.any(Blob),
            {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "image/jpeg" }
            }
        );
        expect(screen.getByText("cropping b.heic, 0 more")).toBeInTheDocument();
        await user.click(screen.getByText("skip"));
        expect(screen.queryByText(/cropping/)).not.toBeInTheDocument();
    });

    it("should do nothing when the picker returns no files", async () => {
        await renderSignedIn();

        fireEvent.change(screen.getByLabelText("Choose Photos"), {
            target: { files: null }
        });

        expect(screen.queryByText(/cropping/)).not.toBeInTheDocument();
    });

    it("should show why an upload failed", async () => {
        axiosPost.mockRejectedValue(
            new AxiosError("bad", "400", undefined, undefined, {
                data: { message: "The Frame Holds 50 Photos. Remove One First" }
            } as never)
        );
        const { user } = await renderSignedIn();
        choose(photo("a.jpg"));

        await user.click(screen.getByText("add"));

        expect(
            await screen.findByText("The Frame Holds 50 Photos. Remove One First")
        ).toBeInTheDocument();
    });

    it("should fall back when an upload fails without a reason", async () => {
        axiosPost.mockRejectedValue(new AxiosError("offline"));
        const { user } = await renderSignedIn();
        choose(photo("a.jpg"));

        await user.click(screen.getByText("add"));

        expect(
            await screen.findByText("That photo didn't go through. Try another?")
        ).toBeInTheDocument();
    });

    it("should fall back for any other upload failure", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const { user } = await renderSignedIn();
        choose(photo("a.jpg"));

        await user.click(screen.getByText("add"));

        expect(
            await screen.findByText("That photo didn't go through. Try another?")
        ).toBeInTheDocument();
    });

    it("should turn away files that are not photos", async () => {
        await renderSignedIn();

        choose(photo("notes.txt", "text/plain"), photo("a.png", "image/png"));

        expect(screen.getByText("Photos only — JPEG, PNG, WebP or HEIC.")).toBeInTheDocument();
        expect(screen.getByText("cropping a.png, 0 more")).toBeInTheDocument();
    });

    it("should only take as many photos as the frame has room for", async () => {
        axiosGet.mockResolvedValue({
            data: {
                photos: Array.from({ length: 49 }, (_, i) => ({
                    ...photos[0],
                    id: `p${i.toString()}`
                }))
            }
        });
        await renderSignedIn();
        await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(49));

        choose(photo("a.jpg"), photo("b.jpg"));

        expect(
            screen.getByText("Room for 1 more. The rest didn't make it in.")
        ).toBeInTheDocument();
    });

    it("should refuse drops and choices once the frame is full", async () => {
        axiosGet.mockResolvedValue({
            data: {
                photos: Array.from({ length: 50 }, (_, i) => ({
                    ...photos[0],
                    id: `p${i.toString()}`
                }))
            }
        });
        await renderSignedIn();
        const dropArea = await screen.findByRole("region", { name: "Drop photos here" });

        fireEvent.dragOver(dropArea);
        fireEvent.drop(dropArea, { dataTransfer: { files: [photo("a.jpg")] } });

        expect(screen.queryByText(/cropping/)).not.toBeInTheDocument();
    });

    it("should take dropped photos", async () => {
        await renderSignedIn();
        const dropArea = screen.getByRole("region", { name: "Drop photos here" });

        fireEvent.dragOver(dropArea);
        fireEvent.dragLeave(dropArea, { relatedTarget: dropArea.firstChild });
        fireEvent.dragLeave(dropArea, { relatedTarget: document.body });
        fireEvent.drop(dropArea, { dataTransfer: { files: [photo("a.jpg")] } });

        expect(screen.getByText("cropping a.jpg, 0 more")).toBeInTheDocument();
    });

    it("should remove a photo", async () => {
        const { user, token } = await renderSignedIn();
        await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(1));

        await user.click(document.querySelectorAll("img")[0]);
        await user.click(screen.getByTestId("DeleteOutlinedIcon"));

        expect(axiosPost).toHaveBeenCalledWith(
            "https://api.maxrosoff.com/polaroid/remove",
            { id: "p1" },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    });

    it("should put a photo back when removing fails", async () => {
        axiosPost.mockRejectedValue(new Error("offline"));
        const { user } = await renderSignedIn();
        await waitFor(() => expect(document.querySelectorAll("img")).toHaveLength(1));

        await user.click(document.querySelectorAll("img")[0]);
        await user.click(screen.getByTestId("DeleteOutlinedIcon"));

        expect(await screen.findByText("Couldn't remove that one.")).toBeInTheDocument();
        await waitFor(() => expect(axiosGet).toHaveBeenCalledTimes(2));
    });

    it("should fold the extra line into the description on a phone", async () => {
        mockScreenWidth(390);

        await renderSignedIn();

        expect(screen.getByText(/develop onto the frame.*Can't wait\?/)).toBeInTheDocument();
    });
});
