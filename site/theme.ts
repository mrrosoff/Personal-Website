import { createTheme } from "@mui/material/styles";

export const COLORS = {
    background: "#121212",
    surface: "#1C1C1E",
    field: "#30313D",
    button: "#52535F",
    buttonHover: "#5F6272",
    text: "#FCFCFC",
    light: "#F9F9F9",
    white: "#FFFFFF",
    green: "#2BC903",
    red: "#ff0606",
    muted: "rgba(255, 255, 255, 0.5)",
    faint: "rgba(255, 255, 255, 0.1)"
};

export const FONT = {
    family: "Clacon",
    url: "https://maxrosoff.com/fonts/clacon.ttf"
};

export const TYPE_SIZES = {
    h1: 60,
    h2: 35,
    h4: 26,
    body: "clamp(18px, 5.3vw, 22px)"
};

export function createMuiTheme() {
    return createTheme({
        palette: {
            mode: "dark",
            primary: { main: COLORS.white },
            secondary: { main: COLORS.buttonHover }
        },
        typography: {
            h1: { fontSize: TYPE_SIZES.h1 },
            h2: { fontSize: TYPE_SIZES.h2 },
            h4: { fontSize: TYPE_SIZES.h4 },
            body1: { fontSize: TYPE_SIZES.body }
        },
        components: {
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: COLORS.field,
                        border: `1px solid ${COLORS.faint}`,
                        borderRadius: "6px",
                        boxShadow:
                            "0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 6px rgba(0, 0, 0, 0.25)",
                        transition:
                            "background 0.15s ease, border 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, outline 0.15s ease",
                        overflow: "hidden",
                        outline: "0px solid transparent",
                        "&:hover": {
                            backgroundColor: COLORS.field,
                            border: "1px solid rgba(255, 255, 255, 0.15)"
                        },
                        "&.Mui-focused": {
                            backgroundColor: COLORS.field,
                            borderColor: COLORS.light,
                            outline: "2.5px solid rgba(249, 249, 249, 0.20)",
                            boxShadow:
                                "0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 6px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(249, 249, 249, 0.1)"
                        },
                        "&::before, &::after": {
                            display: "none"
                        }
                    },
                    input: {
                        padding: "16px 16px",
                        lineHeight: "1.5",
                        color: COLORS.light
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    filled: {
                        color: "rgba(249, 249, 249, 0.7)",
                        transform: "translate(17px, 16px) scale(1)",
                        "&.Mui-focused": {
                            color: "rgba(249, 249, 249, 0.7)"
                        },
                        "&.MuiInputLabel-shrink": {
                            opacity: 0,
                            transform: "translate(17px, 16px) scale(1)"
                        }
                    }
                }
            }
        }
    });
}
