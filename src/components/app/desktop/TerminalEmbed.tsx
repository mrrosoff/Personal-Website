import { forwardRef, Ref, useEffect } from "react";

import Terminal from "../../terminal/Terminal";

const TerminalEmbed = (
    props: { scrollContainerRef: React.RefObject<HTMLDivElement | null> },
    ref: Ref<HTMLInputElement | null>
) => {
    useEffect(() => {
        Array.from(document.getElementsByTagName("form")).forEach((form) => {
            form.setAttribute("spellcheck", "false");
        });
    }, []);

    return (
        <Terminal
            ref={ref}
            scrollContainerRef={props.scrollContainerRef}
            theme={{
                background: "#121212",
                promptSymbolColor: "#2BC903",
                commandColor: "#FCFCFC",
                outputColor: "#FCFCFC",
                errorColor: "#ff0606",
                width: "100%",
                height: "88dvh"
            }}
            errorStr={"Command Not Found"}
        />
    );
};

export default forwardRef(TerminalEmbed);
