import { useEffect, useState } from "react";

import { Box, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { validate } from "email-validator";

const MailingList = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
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
            <Typography mt={smallScreen ? 1 : undefined} align={smallScreen ? "center" : undefined}>
                Get notified when new ice-cream flavors are available and hear about other fun
                things.
            </Typography>
            <MailingListForm />
        </Box>
    );
};

const MailingListForm = () => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [email, setEmail] = useState("");
    const [emailIsValid, setEmailIsValid] = useState(true);

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
            flexDirection={"column"}
            alignItems={smallScreen ? "center" : undefined}
            sx={{ paddingTop: smallScreen ? 6 : 2.5 }}
        >
            <TextField
                label="Email"
                variant="standard"
                color="primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!emailIsValid}
            />
        </Box>
    );
};

export default MailingList;
