import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { TerminalTheme } from "../Terminal";

const MOTD_LINKS: Partial<Record<string, { mobile?: string; path?: string }>> = {
    "https://maxrosoff.com/ice-cream": { mobile: "maxrosoff.com", path: "/ice-cream" },
    "https://github.com/mrrosoff/Personal-Website": { mobile: "github.com/mrrosoff" },
    "https://linkedin.com/in/max-rosoff": { mobile: "linkedin.com/in/max-rosoff" }
};

type MessageOfTheDayProps = { theme: TerminalTheme };

export default function MessageOfTheDay(props: MessageOfTheDayProps) {
    const muiTheme = useTheme();
    const smallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));
    const navigate = useNavigate();

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
            {MOTDText.split("\n").map((line, key) => {
                const trimmedLine = line.trim();
                const outputs = [
                    <Box key={"original-line"} sx={{ color: props.theme.outputColor }}>
                        {trimmedLine}
                    </Box>
                ];
                if (trimmedLine.startsWith("*")) {
                    outputs.splice(0, 0, <Box key={"indent"} sx={{ width: 20 }} />);
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
                        <Box key={"link-line"} sx={{ color: props.theme.outputColor }}>
                            {front}
                            <Box
                                component="a"
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
                                sx={{
                                    color: "#FCFCFC",
                                    fontSize: 20
                                }}
                            >
                                {displayText}
                            </Box>
                            {back}
                        </Box>
                    );
                }
                return (
                    <Box key={key} sx={{ display: "flex" }}>
                        {outputs}
                    </Box>
                );
            })}
            <Box sx={{ height: 20 }} />
        </>
    );
}
