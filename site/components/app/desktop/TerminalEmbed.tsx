import { forwardRef, type Ref, useEffect } from "react";

import Terminal, { TERMINAL_COLORS } from "../../terminal/Terminal";

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
            theme={{ ...TERMINAL_COLORS, width: "100%", height: "88dvh" }}
            errorStr={"Command Not Found"}
        />
    );
};

export default forwardRef(TerminalEmbed);
