import { Box, Stack, Typography } from "@mui/material";
import { COLORS } from "../../../../theme";

type HeaderProps = { creationDate: string; smallScreen: boolean };

export default function Header(props: HeaderProps) {
    return (
        <>
            <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
                <Box
                    component="img"
                    src="/images/logo.webp"
                    alt="Logo"
                    sx={{ width: 100, height: 100 }}
                />
                <Box>
                    {props.smallScreen ? (
                        <>
                            <Typography>Rosoff OS</Typography>
                            <Typography>(BETA PROGRAM)</Typography>
                        </>
                    ) : (
                        <Typography>Rosoff OS (BETA PROGRAM)</Typography>
                    )}
                </Box>
            </Stack>
            <Box>
                <Typography>Released: {props.creationDate}</Typography>
                <Box
                    component="a"
                    href="https://github.com/mrrosoff/Personal-Website"
                    target="_blank"
                    sx={{ color: COLORS.text, fontSize: 22 }}
                >
                    Open Source (BETA 4.1.2)
                </Box>
            </Box>
        </>
    );
}
