import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { mockSmallScreen, mockTerminalTheme, renderWithApp } from "../../../helpers/render";
import { mockEmulatorState } from "../../../helpers/terminal";
import { mockToken } from "../../../setup";

import { UserType } from "../../../../api/types";
import { useAppContext } from "../../../../site/components/AppContext";
import Terminal from "../../../../site/components/terminal/Terminal";
import type EmulatorState from "../../../../site/javascript-terminal/emulatorState/EmulatorState";
import type * as Sudo from "../../../../site/javascript-terminal/commands/sudo";
import type * as ReactRouter from "react-router-dom";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("../../../../site/javascript-terminal/commands/sudo", async (importOriginal) => {
    const actual = await importOriginal<typeof Sudo>();
    return { ...actual, authenticateWithPasskey: vi.fn(actual.authenticateWithPasskey) };
});
vi.mock("react-router-dom", async (importOriginal) => ({
    ...(await importOriginal<typeof ReactRouter>()),
    useNavigate: () => navigate
}));

function FriendToken(): ReactNode {
    return <p data-testid="friend-token">{useAppContext().friendToken}</p>;
}

function renderTerminal(emulatorState: EmulatorState = mockEmulatorState()) {
    const ref = createRef<HTMLInputElement>();
    const scrollContainerRef = { current: document.createElement("div") };
    Object.defineProperty(scrollContainerRef.current, "scrollHeight", { value: 500 });
    const result = renderWithApp(
        <>
            <Terminal
                ref={ref}
                theme={mockTerminalTheme}
                errorStr={"Command Not Found"}
                scrollContainerRef={scrollContainerRef}
            />
            <FriendToken />
        </>,
        { emulatorState }
    );
    return { ...result, ref, scrollContainerRef };
}

function input(): HTMLElement {
    return screen.getByRole("textbox");
}

function type(command: string) {
    fireEvent.change(input(), { target: { value: command } });
    fireEvent.keyDown(input(), { key: "Enter" });
}

describe("Terminal", () => {
    it("should run a command and show its output", () => {
        renderTerminal();

        type("echo hello");

        expect(screen.getByText("hello")).toBeInTheDocument();
        expect(screen.getByText("echo hello")).toBeInTheDocument();
    });

    it("should show errors in the error color", () => {
        renderTerminal();

        type("nope");

        expect(screen.getByText("Command Not Found")).toHaveStyle({
            color: mockTerminalTheme.errorColor
        });
    });

    it("should render a command's own elements", () => {
        renderTerminal();

        type("display /media/photo.png");

        expect(screen.getByAltText("Image")).toBeInTheDocument();
    });

    it("should navigate for a command that opens a page", () => {
        renderTerminal();

        type("icecream");

        expect(navigate).toHaveBeenCalledWith("/ice-cream", { replace: true });
    });

    it("should hide the message of the day after clear", () => {
        renderTerminal();

        type("clear");
        type("pwd");

        expect(screen.queryByText(/Welcome To Rosoff OS/)).not.toBeInTheDocument();
    });

    it("should scroll to the newest output", async () => {
        const { scrollContainerRef } = renderTerminal();

        type("pwd");

        await waitFor(() => expect(scrollContainerRef.current.scrollTop).toBe(500));
    });

    it("should not mind a missing scroll container", async () => {
        const { unmount } = renderWithApp(
            <Terminal
                ref={createRef()}
                theme={mockTerminalTheme}
                errorStr={"Command Not Found"}
                scrollContainerRef={{ current: null }}
            />
        );

        type("pwd");
        await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

        expect(screen.getByText("pwd")).toBeInTheDocument();
        unmount();
    });

    it("should walk back and forward through history", () => {
        renderTerminal();
        type("echo one");
        type("echo two");

        fireEvent.keyDown(input(), { key: "ArrowUp" });
        fireEvent.keyDown(input(), { key: "ArrowUp" });
        fireEvent.keyDown(input(), { key: "ArrowUp" });
        expect(input()).toHaveValue("echo one");

        fireEvent.keyDown(input(), { key: "ArrowDown" });
        expect(input()).toHaveValue("echo two");

        fireEvent.keyDown(input(), { key: "ArrowDown" });
        fireEvent.keyDown(input(), { key: "ArrowDown" });
        expect(input()).toHaveValue("");
    });

    it("should stay empty going up with no history", () => {
        renderTerminal();

        fireEvent.keyDown(input(), { key: "ArrowUp" });

        expect(input()).toHaveValue("");
    });

    it("should complete with tab", () => {
        renderTerminal();
        fireEvent.change(input(), { target: { value: "whoa" } });

        fireEvent.keyDown(input(), { key: "Tab" });

        expect(input()).toHaveValue("whoami");
    });

    it("should ignore other keys", () => {
        renderTerminal();
        fireEvent.change(input(), { target: { value: "ls" } });

        fireEvent.keyDown(input(), { key: "a" });

        expect(input()).toHaveValue("ls");
    });

    it("should name the prompt after who is signed in", async () => {
        renderTerminal(mockEmulatorState({ AUTH_TOKEN: await mockToken(UserType.ADMIN) }));

        type("pwd");

        expect(screen.getAllByText("admin@rosoff").length).toBeGreaterThan(0);
    });

    it("should share a friend's sign in with the rest of the site", async () => {
        const token = await mockToken(UserType.FRIEND);

        renderTerminal(mockEmulatorState({ AUTH_TOKEN: token }));

        expect(screen.getByTestId("friend-token")).toHaveTextContent(token);
    });

    it("should not share the admin's sign in", async () => {
        renderTerminal(mockEmulatorState({ AUTH_TOKEN: await mockToken(UserType.ADMIN) }));

        expect(screen.getByTestId("friend-token")).toBeEmptyDOMElement();
    });

    it("should not share a sign in it cannot read", () => {
        renderTerminal(mockEmulatorState({ AUTH_TOKEN: "junk" }));

        expect(screen.getByTestId("friend-token")).toBeEmptyDOMElement();
    });

    it("should list completions under a bare prompt", () => {
        renderTerminal();
        fireEvent.change(input(), { target: { value: "cat home/p" } });

        fireEvent.keyDown(input(), { key: "Tab" });
        fireEvent.keyDown(input(), { key: "Tab" });

        expect(screen.getByText("home/people.csv home/projects")).toBeInTheDocument();
    });

    it("should show earlier output that has no command", () => {
        const emulatorState = mockEmulatorState();
        emulatorState.setOutputs([{ output: [{ output: "restored" }] }]);

        renderTerminal(emulatorState);

        expect(screen.getByText("restored")).toBeInTheDocument();
    });

    it("should hide the prompt while a command takes over", () => {
        const emulatorState = mockEmulatorState();
        emulatorState.setBlockingMode({ content: <p>{"game"}</p> });

        renderTerminal(emulatorState);

        expect(screen.getByText("game")).toBeInTheDocument();
        expect(screen.queryByText("dev@rosoff")).not.toBeInTheDocument();
    });
});

describe("password prompt", () => {
    it("should ask for a passkey and explain it is unavailable locally", async () => {
        renderTerminal();

        type("sudo pwd");

        expect(
            await screen.findByText("Passkey Auth Unavailable In Local Environment")
        ).toBeInTheDocument();
    });

    it("should show dots while signing in and ignore keys", () => {
        vi.useFakeTimers();
        const emulatorState = mockEmulatorState();
        emulatorState.setPasswordPromptState({ loading: true });
        renderTerminal(emulatorState);

        act(() => void vi.advanceTimersByTime(600));
        fireEvent.keyDown(input(), { key: "Enter" });

        expect(screen.getByText("Password:")).toBeInTheDocument();
        expect(screen.getByText("..")).toBeInTheDocument();
        vi.useRealTimers();
    });
});

describe("admin console", () => {
    async function openConsole() {
        const emulatorState = mockEmulatorState({ AUTH_TOKEN: await mockToken(UserType.ADMIN) });
        const result = renderTerminal(emulatorState);
        type("console");
        await screen.findByText("=== Admin Console ===");
        return { ...result, emulatorState };
    }

    it("should open and move through the menu", async () => {
        const { emulatorState } = await openConsole();

        fireEvent.keyDown(input(), { key: "ArrowDown" });

        await waitFor(() =>
            expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe("SendMarketingEmails")
        );
    });

    it("should let command key shortcuts through", async () => {
        const { emulatorState } = await openConsole();

        fireEvent.keyDown(input(), { key: "ArrowDown", metaKey: true });

        expect(emulatorState.getAdminConsoleMode()?.selectedOption).toBe("IceCreamInventory");
    });

    it("should close on ctrl+c", async () => {
        await openConsole();

        fireEvent.keyDown(input(), { key: "c", ctrlKey: true });

        await waitFor(() =>
            expect(screen.queryByText("=== Admin Console ===")).not.toBeInTheDocument()
        );
    });

    it("should pass other keys to the console", async () => {
        const { emulatorState } = await openConsole();

        fireEvent.keyDown(input(), { key: "a" });

        expect(emulatorState.getAdminConsoleMode()?.screen).toBe("main");
    });

    it("should type pasted text", async () => {
        const { emulatorState } = await openConsole();
        fireEvent.keyDown(input(), { key: "ArrowDown" });
        fireEvent.keyDown(input(), { key: "Enter" });
        await screen.findByText(/Send Marketing Emails\)/);

        fireEvent.paste(input(), { clipboardData: { getData: () => "Hi!" } });

        await waitFor(() =>
            expect(emulatorState.getAdminConsoleMode()?.marketing?.message).toBe("Hi!")
        );
    });

    it("should take taps from the menus", async () => {
        mockSmallScreen();
        const { user, emulatorState } = await openConsole();

        await user.click(screen.getByText(/5\. Exit/));

        await waitFor(() => expect(emulatorState.getAdminConsoleMode()).toBeUndefined());
    });

    it("should focus the hidden input for key presses", async () => {
        const { ref } = await openConsole();

        expect(ref.current).toHaveFocus();
    });
});
