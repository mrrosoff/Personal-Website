import { Grid } from "@mui/material";

import { useAppContext } from "../../AppContext";
import OutputError from "../output/OutputError";
import OutputHeader from "../output/OutputHeader";
import OutputText from "../output/OutputText";
import type { TerminalTheme } from "../Terminal";

type OutputsProps = { theme: TerminalTheme; promptSymbol: string };

export default function Outputs(props: OutputsProps) {
    const { emulatorState } = useAppContext();
    return emulatorState.getOutputs().map((content, index) => (
        <Grid key={index} container direction={"column"}>
            <Grid>
                <OutputHeader
                    theme={props.theme}
                    promptSymbol={content.promptSymbol ?? props.promptSymbol}
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
                            <OutputError theme={props.theme}>{output.output as string}</OutputError>
                        </Grid>
                    );
                }
                return (
                    <Grid key={idx}>
                        <OutputText theme={props.theme}>{output.output as string}</OutputText>
                    </Grid>
                );
            })}
        </Grid>
    ));
}
