import { forwardRef, lazy, Suspense, useEffect, useReducer, useState } from "react";
import type { ChangeEvent, KeyboardEvent, Ref } from "react";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { UserType } from "../../../api/types";
import { Emulator } from "../../javascript-terminal";
import type EmulatorState from "../../javascript-terminal/emulator-state/EmulatorState";
import { handleAdminConsoleKeyPress } from "../../javascript-terminal/commands/console";
import { authenticateWithPasskey } from "../../javascript-terminal/commands/sudo";
import { decodeToken } from "../../auth";
import { useAppContext } from "../AppContext";

import CommandInput from "./CommandInput";
import OutputHeader from "./output/OutputHeader";
import OutputText from "./output/OutputText";
import OutputError from "./output/OutputError";

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

const MOTD_LINKS: Partial<Record<string, { mobile?: string; path?: string }>> = {
    "https://maxrosoff.com/ice-cream": { mobile: "maxrosoff.com", path: "/ice-cream" },
    "https://github.com/mrrosoff/Personal-Website": { mobile: "github.com/mrrosoff" },
    "https://linkedin.com/in/max-rosoff": { mobile: "linkedin.com/in/max-rosoff" }
};

const renderOutputs = (
    emulatorState: EmulatorState,
    props: { theme: TerminalTheme },
    promptSymbol = "dev@rosoff"
) => {
    return emulatorState.getOutputs().map((content, index) => (
        <Grid key={index} container direction={"column"}>
            <Grid>
                <OutputHeader
                    {...props}
                    promptSymbol={content.promptSymbol ?? promptSymbol}
                    cwd={content.cwd}
                >
                    {content.command ?? ""}
                </OutputHeader>
            </Grid>
            {content.output.map((output, idx) => {
                if (output.type === "navigate") {
                    return null;
                }
                if (output.type === "react") {
                    return <Grid key={idx}>{output.output}</Grid>;
                }
                if (output.type === "error") {
                    return (
                        <Grid key={idx}>
                            <OutputError {...props}>{output.output as string}</OutputError>
                        </Grid>
                    );
                }
                return (
                    <Grid key={idx}>
                        <OutputText {...props}>{output.output as string}</OutputText>
                    </Grid>
                );
            })}
        </Grid>
    ));
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
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [_, setHistoryIndex] = useState(-1);
    const [loadingDots, setLoadingDots] = useState(0);
    const [, rerender] = useReducer((count: number) => count + 1, 0);

    const runAdminAction = async (key: string, ctrlKey = false) => {
        await handleAdminConsoleKeyPress(key, emulatorState, ctrlKey);
        rerender();
    };

    useEffect(() => {
        const interval = setInterval(() => setLoadingDots((dots) => (dots + 1) % 4), 600);
        return () => clearInterval(interval);
    }, []);

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

    const iceCreamLine = smallScreen
        ? "\n\t\t\t* Ice Cream: ~https://maxrosoff.com/ice-cream~"
        : "";
    const MOTDText = `
		Welcome To Rosoff OS BETA v4.1.2${iceCreamLine}
			* Documentation: ~https://github.com/mrrosoff/Personal-Website~
			* Management: ~https://linkedin.com/in/max-rosoff~
			* Support: ~me@maxrosoff.com~
		0 packages can be updated.
		0 updates are ready to be installed.
	`;

    return (
        <>
            {showMOTD && (
                <>
                    {MOTDText.split("\n").map((line, key) => {
                        const trimmedLine = line.trim();
                        const outputs = [
                            <Box key={"original-line"} style={{ color: props.theme.outputColor }}>
                                {trimmedLine}
                            </Box>
                        ];
                        if (trimmedLine.startsWith("*")) {
                            outputs.splice(0, 0, <Box key={"indent"} width={20} />);
                        }
                        const index = trimmedLine.indexOf("~");
                        if (index !== -1) {
                            const front = trimmedLine.substring(0, index);
                            const backIndex = trimmedLine.indexOf("~", index + 1);
                            const middle = trimmedLine.substring(index + 1, backIndex);
                            const back = trimmedLine.substring(backIndex + 1);
                            const link = MOTD_LINKS[middle];
                            const isEmail = middle.includes("@");
                            const href = isEmail ? `mailto:${middle}` : middle;
                            const displayText = smallScreen ? (link?.mobile ?? middle) : middle;
                            const internalPath = link?.path;
                            outputs[outputs.length - 1] = (
                                <Box key={"link-line"} style={{ color: props.theme.outputColor }}>
                                    {front}
                                    <a
                                        href={href}
                                        target={internalPath ? undefined : "_blank"}
                                        onClick={
                                            internalPath
                                                ? (e) => {
                                                      e.preventDefault();
                                                      void navigate(internalPath);
                                                  }
                                                : undefined
                                        }
                                        style={{
                                            color: "#FCFCFC",
                                            fontSize: 20
                                        }}
                                    >
                                        {displayText}
                                    </a>
                                    {back}
                                </Box>
                            );
                        }
                        return (
                            <Box key={key} display={"flex"}>
                                {outputs}
                            </Box>
                        );
                    })}
                    <Box height={20} />
                </>
            )}
            <Grid container direction={"column"} justifyContent={"flex-start"} spacing={1}>
                {renderOutputs(emulatorState, props, promptSymbol)}
                {emulatorState.getAdminConsoleMode()?.screen && (
                    <Box height={280}>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box component="span" style={{ color: props.theme.outputColor }}>
                            Password:
                        </Box>
                        {passwordPrompt.loading ? (
                            <Box component="span" style={{ color: props.theme.outputColor }}>
                                {".".repeat(loadingDots + 1)}
                            </Box>
                        ) : (
                            <Box
                                data-testid="cursor"
                                width={8}
                                height={18}
                                sx={{
                                    visibility: loadingDots % 2 === 0 ? "visible" : "hidden",
                                    background: "#FFFFFF"
                                }}
                            />
                        )}
                        <input
                            ref={ref}
                            type="text"
                            value=""
                            onKeyDown={onKeyDown}
                            style={{
                                width: 0,
                                height: 0,
                                opacity: 0,
                                position: "absolute",
                                top: 0,
                                left: 0
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            readOnly
                        />
                    </Box>
                ) : emulatorState.getAdminConsoleMode()?.screen ? (
                    <Grid style={{ width: 0, height: 0 }}>
                        <input
                            ref={ref}
                            type="text"
                            value=""
                            onKeyDown={onKeyDown}
                            onPaste={(e) => void onPaste(e)}
                            style={{
                                width: 0,
                                height: 0,
                                opacity: 0,
                                position: "absolute",
                                top: 0,
                                left: 0
                            }}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                        />
                    </Grid>
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
            </Grid>
        </>
    );
};

export default forwardRef(Terminal);
