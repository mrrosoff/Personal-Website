import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockToken } from "../../setup";

import { UserType } from "../../../api/types";

async function loadAppContext() {
    vi.resetModules();
    return import("../../../site/components/AppContext");
}

function BootFlag(props: { useAppContext: () => { shouldBootUp: boolean } }) {
    return <p>{String(props.useAppContext().shouldBootUp)}</p>;
}

describe("AppProvider", () => {
    it("should boot up on a first production visit", async () => {
        vi.stubEnv("PROD", true);
        sessionStorage.clear();
        const { AppProvider, useAppContext } = await loadAppContext();

        render(
            <AppProvider>
                <BootFlag useAppContext={useAppContext} />
            </AppProvider>
        );

        expect(screen.getByText("true")).toBeInTheDocument();
    });

    it("should skip booting once the visitor has booted", async () => {
        vi.stubEnv("PROD", true);
        sessionStorage.setItem("HAS_BOOTED_UP", "true");
        const { AppProvider, useAppContext } = await loadAppContext();

        render(
            <AppProvider>
                <BootFlag useAppContext={useAppContext} />
            </AppProvider>
        );

        expect(screen.getByText("false")).toBeInTheDocument();
    });

    it("should restore a sign in from this session", async () => {
        const token = await mockToken(UserType.ADMIN);
        sessionStorage.setItem("AUTH_TOKEN", token);
        const { AppProvider, useAppContext } = await loadAppContext();

        const { result } = renderHook(() => useAppContext(), { wrapper: AppProvider });

        expect(result.current.emulatorState.getEnvVariables().AUTH_TOKEN).toBe(token);
    });

    it("should forget an expired sign in", async () => {
        sessionStorage.setItem("AUTH_TOKEN", await mockToken(UserType.ADMIN, { expiresIn: -10 }));
        const { AppProvider, useAppContext } = await loadAppContext();

        const { result } = renderHook(() => useAppContext(), { wrapper: AppProvider });

        expect(result.current.emulatorState.getEnvVariables().AUTH_TOKEN).toBeUndefined();
        expect(sessionStorage.getItem("AUTH_TOKEN")).toBeNull();
    });

    it("should need a provider", async () => {
        const { useAppContext } = await loadAppContext();

        expect(() => renderHook(() => useAppContext())).toThrow(
            "useAppContext must be used within AppProvider"
        );
    });
});

describe("exit", () => {
    async function runExit(environmentVariables: Record<string, string>) {
        const { AppProvider, useAppContext } = await loadAppContext();
        const { result } = renderHook(() => useAppContext(), { wrapper: AppProvider });
        const state = result.current.emulatorState;
        state.setEnvVariables({ ...state.getEnvVariables(), ...environmentVariables });
        const exit = state.getCommandMapping().exit.functionDef;
        return { output: exit(state, []), state };
    }

    it("should sign out when signed in", async () => {
        sessionStorage.setItem("AUTH_TOKEN", "token");

        const { output, state } = await runExit({ AUTH_TOKEN: "token" });

        expect(output).toEqual({ output: "", type: "text" });
        expect(state.getEnvVariables().AUTH_TOKEN).toBeUndefined();
        expect(sessionStorage.getItem("AUTH_TOKEN")).toBeNull();
    });

    it("should try to close the window when signed out", async () => {
        const close = vi.fn();
        vi.stubGlobal("close", close);

        const { output } = await runExit({});

        expect(close).toHaveBeenCalled();
        expect(output).toEqual({ output: "Can't Close Window", type: "error" });
    });
});
