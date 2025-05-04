import { forwardRef, useEffect } from "react";

import { CommandMapping, DefaultCommandMapping, EmulatorState } from "../../../javascript-terminal";

import Terminal from "../../terminal/Terminal";
import files from "../../../FileSystem";

const TerminalEmbed = (_props: any, ref: any) => {
    useEffect(() => {
        Array.from(document.getElementsByTagName("form")).forEach((form) => {
            form.setAttribute("spellcheck", "false");
        });
    }, []);

    const customState = EmulatorState.create({
        fs: files as any,
        commandMapping: CommandMapping.create({
            ...DefaultCommandMapping,
            exit: {
                functionDef: () => close(),
                optDef: {}
            }
        } as any)
    });

    return (
        <Terminal
            ref={ref}
            theme={{
                background: "#121212",
                promptSymbolColor: "#2BC903",
                commandColor: "#FCFCFC",
                outputColor: "#FCFCFC",
                errorColor: "#ff0606",
                width: "100%",
                height: "88vh"
            }}
            emulatorState={customState}
            promptSymbol={"dev@rosoff"}
            errorStr={"Command Not Found"}
        />
    );
};

export default forwardRef(TerminalEmbed);
