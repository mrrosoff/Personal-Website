import { forwardRef, lazy, Suspense, useEffect, useReducer, useState } from "react";
import type { ChangeEvent, KeyboardEvent, Ref } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { UserType } from "../../../api/types";
import { Emulator } from "../../javascript-terminal";
import { handleAdminConsoleKeyPress } from "../../javascript-terminal/commands/console";
import { authenticateWithPasskey } from "../../javascript-terminal/commands/sudo";
import { decodeToken } from "../../auth";
import { useAppContext } from "../AppContext";

import CommandInput from "./CommandInput";
import HiddenInput from "./Terminal/HiddenInput";
import MessageOfTheDay from "./Terminal/MessageOfTheDay";
import Outputs from "./Terminal/Outputs";
import PasswordPrompt from "./Terminal/PasswordPrompt";

const AdminConsole = lazy(() => import("./admin/AdminConsole"));

export const TERMINAL_COLORS = {
    background: "#121212",
    promptSymbolColor: "#2BC903",
    commandColor: "#FCFCFC",
    outputColor: "#FCFCFC",
    errorColor: "#ff0606"
};

export type TerminalTheme = {
    background: string;
    promptSymbolColor: string;
    commandColor: string;
    outputColor: string;
    errorColor: string;
    width: string | number;
    height: string | number;
};

const emulator = new Emulator();

const Terminal = (
    props: {
        errorStr: string;
        theme: TerminalTheme;
        scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    },
    ref: Ref<HTMLInputElement | null>
) => {
    const { setFriendToken, emulatorState, setEmulatorState } = useAppContext();
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [_, setHistoryIndex] = useState(-1);
    const [, rerender] = useReducer((count: number) => count + 1, 0);

    const runAdminAction = async (key: string, ctrlKey = false) => {
        await handleAdminConsoleKeyPress(key, emulatorState, ctrlKey);
        rerender();
    };

    const passwordPrompt = emulatorState.getPasswordPromptState();
    const adminConsoleScreen = emulatorState.getAdminConsoleMode()?.screen;

    useEffect(() => {
        if (typeof ref === "object" && ref?.current) {
            ref.current.focus({ preventScroll: true });
        }
    }, [ref, passwordPrompt, adminConsoleScreen]);

    useEffect(() => {
        if (passwordPrompt && !passwordPrompt.loading) {
            const authenticate = async () => {
                await authenticateWithPasskey(emulator, emulatorState);
                rerender();
            };
            void authenticate();
        }
    }, [emulatorState, passwordPrompt]);

    const authToken = emulatorState.getEnvVariables().AUTH_TOKEN;
    const authPayload = authToken ? decodeToken(authToken) : null;
    const promptUser =
        authPayload?.userType === UserType.ADMIN ? "admin" : (authPayload?.id ?? "dev");
    const promptSymbol = `${promptUser}@rosoff`;

    const friendToken = authPayload?.userType === UserType.FRIEND ? authToken : undefined;

    useEffect(() => {
        setFriendToken(friendToken ?? "");
    }, [friendToken, setFriendToken]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (props.scrollContainerRef.current) {
                props.scrollContainerRef.current.scrollTop =
                    props.scrollContainerRef.current.scrollHeight;
            }
        }, 0);
    };

    const onPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        for (const character of e.clipboardData.getData("text")) {
            await handleAdminConsoleKeyPress(character, emulatorState);
        }
        rerender();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (passwordPrompt) {
            return;
        }

        const adminConsoleMode = emulatorState.getAdminConsoleMode();
        if (adminConsoleMode?.screen) {
            if (e.metaKey) return; // Allow CMD key for Mac users

            const handledKeys = [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Enter",
                "Escape"
            ];

            if (handledKeys.includes(e.key) || (e.ctrlKey && e.key === "c")) {
                e.preventDefault();
            }
            void runAdminAction(e.key, e.ctrlKey);
            return;
        }

        switch (e.key) {
            case "ArrowUp": {
                e.preventDefault();
                const historyUp = emulatorState.getHistory();
                setHistoryIndex((prevState) => {
                    const nextIndexValue =
                        prevState < historyUp.length - 1 ? prevState + 1 : prevState;
                    setInput(historyUp[historyUp.length - nextIndexValue - 1] ?? "");
                    return nextIndexValue;
                });
                scrollToBottom();
                break;
            }

            case "ArrowDown": {
                e.preventDefault();
                const historyDown = emulatorState.getHistory();
                setHistoryIndex((prevState) => {
                    const nextIndexValue = prevState > -1 ? prevState - 1 : prevState;
                    setInput(historyDown[historyDown.length - nextIndexValue - 1] ?? "");
                    return nextIndexValue;
                });
                scrollToBottom();
                break;
            }

            case "Tab":
                e.preventDefault();
                setInput(emulator.autocomplete(emulatorState, input));
                rerender();
                scrollToBottom();
                break;

            case "Enter": {
                e.preventDefault();
                const newState = emulator.execute(emulatorState, input, props.errorStr);
                const outputs = newState.getOutputs();
                const latest = outputs.at(-1);
                if (latest) {
                    latest.promptSymbol = promptSymbol;
                    newState.setOutputs([...outputs]);
                }
                setEmulatorState(newState);
                setInput("");
                setHistoryIndex(-1);
                rerender();
                scrollToBottom();

                const target = latest?.output.find((result) => result.type === "navigate");
                if (target) {
                    void navigate(target.output as string, { replace: true });
                }
                break;
            }
        }
    };

    const showMOTD = !emulatorState.getHistory().includes("clear");

    return (
        <>
            {showMOTD && <MessageOfTheDay theme={props.theme} />}
            <Stack spacing={1}>
                <Outputs theme={props.theme} promptSymbol={promptSymbol} />
                {emulatorState.getAdminConsoleMode()?.screen && (
                    <Box sx={{ height: 280 }}>
                        <Suspense fallback={null}>
                            <AdminConsole
                                theme={props.theme}
                                onAction={(key) => void runAdminAction(key)}
                            />
                        </Suspense>
                    </Box>
                )}
                {emulatorState.getBlockingMode()?.content && (
                    <Box>{emulatorState.getBlockingMode()?.content}</Box>
                )}
                {passwordPrompt ? (
                    <PasswordPrompt theme={props.theme} loading={passwordPrompt.loading ?? false}>
                        <HiddenInput ref={ref} onKeyDown={onKeyDown} readOnly />
                    </PasswordPrompt>
                ) : emulatorState.getAdminConsoleMode()?.screen ? (
                    <Box sx={{ width: 0, height: 0 }}>
                        <HiddenInput
                            ref={ref}
                            onKeyDown={onKeyDown}
                            onPaste={(e) => void onPaste(e)}
                        />
                    </Box>
                ) : emulatorState.getBlockingMode() ? null : (
                    <CommandInput
                        ref={ref}
                        value={input}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        promptSymbol={promptSymbol}
                        theme={props.theme}
                    />
                )}
            </Stack>
        </>
    );
};

export default forwardRef(Terminal);
