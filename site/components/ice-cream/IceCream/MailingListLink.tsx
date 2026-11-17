import { Link as RouterLink } from "react-router-dom";
import { Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";

export default function MailingListLink() {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Typography sx={{ mt: smallScreen ? 4 : -1 }}>
            Want to stay updated?{" "}
            <Link
                component={RouterLink}
                to="/ice-cream/mailing-list"
                underline="hover"
                sx={{
                    cursor: "pointer",
                    color: "inherit",
                    verticalAlign: "baseline",
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.3
                }}
            >
                Join our mailing list
                <LaunchIcon sx={{ fontSize: 10, position: "relative", top: -4 }} />
            </Link>{" "}
            for new flavor announcements.
        </Typography>
    );
}
