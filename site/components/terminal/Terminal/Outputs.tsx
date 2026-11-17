import { Box, Stack } from "@mui/material";

import { useAppContext } from "../../AppContext";
import OutputError from "../output/OutputError";
import OutputHeader from "../output/OutputHeader";
import OutputText from "../output/OutputText";
import type { TerminalTheme } from "../Terminal";

type OutputsProps = { theme: TerminalTheme; promptSymbol: string };

export default function Outputs(props: OutputsProps) {
    const { emulatorState } = useAppContext();
    return emulatorState.getOutputs().map((content, index) => (
        <Stack key={index}>
            <OutputHeader
                theme={props.theme}
                promptSymbol={content.promptSymbol ?? props.promptSymbol}
                cwd={content.cwd}
            >
                {content.command ?? ""}
            </OutputHeader>
            {content.output.map((output, idx) => {
                if (output.type === "navigate") {
                    return null;
                }
                if (output.type === "react") {
                    return <Box key={idx}>{output.output}</Box>;
                }
                if (output.type === "error") {
                    return (
                        <OutputError key={idx} theme={props.theme}>
                            {output.output as string}
                        </OutputError>
                    );
                }
                return (
                    <OutputText key={idx} theme={props.theme}>
                        {output.output as string}
                    </OutputText>
                );
            })}
        </Stack>
    ));
}
