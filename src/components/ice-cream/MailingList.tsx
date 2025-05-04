import { useEffect, useState } from "react";

import { Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DoneIcon from "@mui/icons-material/Done";
import { validate } from "email-validator";

import icecreamImage from "../../assets/images/ice-cream.png";

const MailingList = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            alignItems={smallScreen ? "center" : undefined}
            height={"100%"}
            overflow={"hidden"}
        >
            <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={smallScreen ? "center" : undefined}
            >
                <Typography
                    variant="h1"
                    align={smallScreen ? "center" : undefined}
                    sx={{ maxWidth: smallScreen ? 300 : undefined }}
                >
                    Join The Mailing List
                </Typography>
                <Typography
                    mt={smallScreen ? 1 : undefined}
                    align={smallScreen ? "center" : undefined}
                >
                    Get notified when new ice-cream flavors are available and hear about other fun
                    things.
                </Typography>
                <MailingListForm />
            </Box>
            <img
                src={icecreamImage}
                alt="Ice Cream"
                width={smallScreen ? 200 : 400}
                style={{ transform: "rotate(15deg)" }}
            />
        </Box>
    );
};

const MailingListForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [email, setEmail] = useState("");
    const [emailIsValid, setEmailIsValid] = useState(true);
    const [isSent, setIsSent] = useState(false);

    useEffect(() => {
        const isValid = !email || validate(email);
        if (isValid) {
            setEmailIsValid(true);
            return;
        }

        const timeout = setTimeout(() => setEmailIsValid(false), 2500);
        return () => clearTimeout(timeout);
    }, [email]);

    return (
        <Box
            display={"flex"}
            flexDirection={smallScreen ? "column" : "row"}
            alignItems={"center"}
            sx={{ paddingTop: smallScreen ? 6 : 4 }}
        >
            <TextField
                label="Email"
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!emailIsValid}
                sx={{ width: smallScreen ? 300 : 500 }}
            />
            <IconButton sx={{ ml: 2, mt: 2 }} disabled={isSent} onClick={() => setIsSent(true)}>
                {isSent ? <DoneIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
        </Box>
    );
};

export default MailingList;
