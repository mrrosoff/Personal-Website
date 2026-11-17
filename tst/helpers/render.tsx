import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { render as renderEmailHtml } from "@react-email/render";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { AppContext } from "../../site/components/AppContext";
import { TERMINAL_COLORS } from "../../site/components/terminal/Terminal";
import type { TerminalTheme } from "../../site/components/terminal/Terminal";
import type EmulatorState from "../../site/javascript-terminal/emulator-state/EmulatorState";
import { mockEmulatorState } from "./terminal";

export const mockTerminalTheme: TerminalTheme = {
    ...TERMINAL_COLORS,
    width: "100%",
    height: "100%"
};

type AppOptions = {
    emulatorState?: EmulatorState;
    route?: string;
    shouldBootUp?: boolean;
    friendToken?: string;
};

function MockAppProvider(props: AppOptions & { children: ReactNode }) {
    const [shouldBootUp, setShouldBootUp] = useState(props.shouldBootUp ?? false);
    const [friendToken, setFriendToken] = useState(props.friendToken ?? "");
    const [emulatorState, setEmulatorState] = useState(
        () => props.emulatorState ?? mockEmulatorState()
    );
    return (
        <AppContext.Provider
            value={{
                shouldBootUp,
                setShouldBootUp,
                friendToken,
                setFriendToken,
                emulatorState,
                setEmulatorState
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
}

function LocationProbe() {
    const location = useLocation();
    return (
        <output data-testid="location" hidden>
            {location.pathname + location.search}
        </output>
    );
}

export function renderWithApp(ui: ReactElement, options: AppOptions = {}) {
    const user = userEvent.setup();
    const result = render(
        <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
            <MemoryRouter initialEntries={[options.route ?? "/"]}>
                <MockAppProvider {...options}>
                    {ui}
                    <LocationProbe />
                </MockAppProvider>
            </MemoryRouter>
        </ThemeProvider>
    );
    return { ...result, user };
}

export function mockSmallScreen(): void {
    vi.stubGlobal(
        "matchMedia",
        vi.fn((media: string) => ({
            matches: true,
            media,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn()
        }))
    );
}

export async function renderEmail(email: ReactElement): Promise<string> {
    return (await renderEmailHtml(email)).replaceAll("<!-- -->", "");
}
