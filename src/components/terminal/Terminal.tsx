import { ChangeEvent, KeyboardEvent, forwardRef, Ref, useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";
import { Emulator, EmulatorState } from "../../javascript-terminal";
import { handleAdminConsoleKeyPress } from "../../javascript-terminal/commands/console";
import { handlePasswordPromptKeyPress } from "../../javascript-terminal/commands/sudo";
import AdminConsole from "./admin/AdminConsole";

import CommandInput from "./CommandInput";
import OutputHeader from "./output/OutputHeader";
import OutputText from "./output/OutputText";
import OutputError from "./output/OutputError";

export type TerminalTheme = {
    background: string;
    promptSymbolColor: string;
    commandColor: string;
    outputColor: string;
    errorColor: string;
    width: string | number;
    height: string | number;
};

const Terminal = (
    props: {
        emulatorState: EmulatorState;
        errorStr: string;
        theme: TerminalTheme;
        promptSymbol: string;
        scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    },
    ref: Ref<HTMLInputElement | null>
) => {
    const [showMOTD, setShowMOTD] = useState(true);
    const [input, setInput] = useState("");
    const [emulatorState, setEmulatorState] = useState(props.emulatorState);
    const [outputs, setOutputs] = useState([]);
    const [_, setHistoryIndex] = useState(-1);
    const [visibleCursor, setVisibleCursor] = useState<boolean>(true);

    let emulator = new Emulator();

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCursor((visible) => !visible);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (typeof ref === "object" && ref?.current) {
            ref.current.focus({ preventScroll: true });
        }
    }, [emulatorState.getPasswordPromptState(), emulatorState.getAdminConsoleMode()?.screen]);

    const onKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        const passwordPrompt = emulatorState.getPasswordPromptState();
        if (passwordPrompt) {
            if (e.metaKey) return; // Allow CMD key for Mac users

            e.preventDefault();

            if (e.key === "Backspace") {
                return setInput(input.slice(0, -1));
            }
            if (e.key.length === 1 && !e.ctrlKey) {
                return setInput(input + e.key);
            }

            const shouldClearInput = await handlePasswordPromptKeyPress(
                emulator,
                emulatorState,
                input,
                e.key,
                e.ctrlKey
            );
            if (shouldClearInput) {
                setInput("");
                if (e.key === "Enter") {
                    setTimeout(() => {
                        if (props.scrollContainerRef.current) {
                            props.scrollContainerRef.current.scrollTop =
                                props.scrollContainerRef.current.scrollHeight;
                        }
                    }, 0);
                }
            }
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
            return await handleAdminConsoleKeyPress(e.key, emulatorState, e.ctrlKey);
        }

        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                const historyUp = emulatorState.getHistory();
                setHistoryIndex((prevState) => {
                    const nextIndexValue =
                        prevState < historyUp.length - 1 ? prevState + 1 : prevState;
                    setInput(historyUp[historyUp.length - nextIndexValue - 1]);
                    return nextIndexValue;
                });
                break;

            case "ArrowDown":
                e.preventDefault();
                const historyDown = emulatorState.getHistory();
                setHistoryIndex((prevState) => {
                    const nextIndexValue = prevState > -1 ? prevState - 1 : prevState;
                    const nextInputValue = historyDown[historyDown.length - nextIndexValue - 1];
                    setInput(nextInputValue ? nextInputValue : "");
                    return nextIndexValue;
                });
                break;

            case "Tab":
                e.preventDefault();
                setInput(emulator.autocomplete(emulatorState, input));
                setOutputs(calculateOutputs());
                break;

            case "Enter":
                e.preventDefault();
                setEmulatorState(emulator.execute(emulatorState, input, props.errorStr));
                setInput("");
                setHistoryIndex(-1);
                setOutputs(calculateOutputs());
                setTimeout(() => {
                    if (props.scrollContainerRef.current) {
                        props.scrollContainerRef.current.scrollTop =
                            props.scrollContainerRef.current.scrollHeight;
                    }
                }, 0);
                break;
        }
    };

    if (!emulatorState) {
        return null;
    }

    const calculateOutputs = () => {
        if (showMOTD && emulatorState.getHistory().includes("clear")) {
            setShowMOTD(false);
        }
        return emulatorState.getOutputs().map((content: any, index: number) => (
            <Grid key={index} container direction={"column"}>
                <Grid>
                    <OutputHeader {...props} cwd={content.cwd}>
                        {content.command}
                    </OutputHeader>
                </Grid>
                {content.output.map((output: any, index: number) => {
                    if (output.type === "error") {
                        return (
                            <Grid key={index}>
                                <OutputError {...props}>{output.output}</OutputError>
                            </Grid>
                        );
                    } else if (output.type === "react") {
                        return <Grid key={index}>{output.output}</Grid>;
                    } else {
                        return (
                            <Grid key={index}>
                                <OutputText {...props}>{output.output}</OutputText>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        ));
    };

    useEffect(() => {
        setOutputs(calculateOutputs());
    }, [input, emulatorState]);

    const MOTDText = `
		Welcome To Rosoff OS BETA v4.1.2
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
                        if (trimmedLine.charAt(0) === "*") {
                            outputs.splice(0, 0, <Box key={"indent"} width={20} />);
                        }
                        const index = trimmedLine.indexOf("~");
                        if (index !== -1) {
                            const front = trimmedLine.substring(0, index);
                            const backIndex = trimmedLine.indexOf("~", index + 1);
                            const middle = trimmedLine.substring(index + 1, backIndex);
                            const back = trimmedLine.substring(backIndex + 1);
                            const href = middle.includes("@") ? "mailto:" : "";
                            outputs[outputs.length - 1] = (
                                <Box key={"link-line"} style={{ color: props.theme.outputColor }}>
                                    {front}
                                    <a
                                        href={href}
                                        target="_blank"
                                        style={{
                                            color: "#FCFCFC",
                                            fontSize: 20
                                        }}
                                    >
                                        {middle}
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
                {outputs}
                {emulatorState.getAdminConsoleMode()?.screen && (
                    <Box height={280}>
                        <AdminConsole emulatorState={emulatorState} theme={props.theme} />
                    </Box>
                )}
                {emulatorState.getPasswordPromptState() ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box component="span" style={{ color: props.theme.outputColor }}>
                            Password:
                        </Box>
                        <Box
                            width={8}
                            height={18}
                            sx={{
                                visibility: visibleCursor ? "visible" : "hidden",
                                background: "#FFFFFF"
                            }}
                        />
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
                            autoCapitalize="off"
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
                            style={{
                                width: 0,
                                height: 0,
                                opacity: 0,
                                position: "absolute",
                                top: 0,
                                left: 0
                            }}
                            readOnly
                        />
                    </Grid>
                ) : (
                    <CommandInput
                        ref={ref}
                        value={input}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        promptSymbol={props.promptSymbol}
                        theme={props.theme}
                        emulatorState={emulatorState}
                    />
                )}
            </Grid>
        </>
    );
};

export default forwardRef(Terminal);
