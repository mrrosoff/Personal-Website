import { forwardRef, useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";
import { Emulator } from "../../javascript-terminal";

import CommandInput from "./CommandInput";

import OutputHeader from "./output/OutputHeader";
import OutputText from "./output/OutputText";
import OutputError from "./output/OutputError";

const Terminal = (props: any, ref: any) => {
    const [showMOTD, setShowMOTD] = useState(true);
    const [input, setInput] = useState("");
    const [emulatorState, setEmulatorState] = useState(props.emulatorState);
    const [outputs, setOutputs] = useState([]);
    const [_, setHistoryIndex] = useState(-1);

    let emulator = new Emulator();

    const onKeyDown = (e: any) => {
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
        return emulatorState.getOutputs().map((content: any, key: any) => (
            <Grid key={key} container direction={"column"}>
                <Grid>
                    <OutputHeader cwd={content.cwd} {...props}>
                        {content.command}
                    </OutputHeader>
                </Grid>
                {content.output.map((output: any, key: any) => {
                    if (output.type === "error") {
                        return (
                            <Grid key={key}>
                                <OutputError {...props}>{output.output}</OutputError>
                            </Grid>
                        );
                    } else if (output.type === "react") {
                        return <Grid key={key}>{output.output}</Grid>;
                    } else {
                        return (
                            <Grid key={key}>
                                <OutputText {...props}>{output.output}</OutputText>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        ));
    };

    useEffect(() => setOutputs(calculateOutputs()), [input]);

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
                <Grid key={outputs.length}>
                    <CommandInput
                        ref={ref}
                        value={input}
                        onChange={(e: any) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        emulatorState={emulatorState}
                        {...props}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default forwardRef(Terminal);
