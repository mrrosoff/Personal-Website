import { RefObject, useRef } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useMatch } from "react-router-dom";

import { Box, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider, StyledEngineProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Page, { LinksAndMenu } from "./app/Page";
import IceCream from "./ice-cream/IceCream";
import MailingList from "./ice-cream/MailingList";
import Unsubscribe from "./ice-cream/Unsubscribe";
import Checkout from "./ice-cream/checkout/Checkout";
import Return from "./ice-cream/checkout/Return";
import { IceCreamCartProvider } from "./ice-cream/IceCreamCartContext";

export const API_URL = "https://api.maxrosoff.com";

const App = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const theme = createTheme({
        palette: {
            mode: "dark",
            primary: { main: "#FFFFFF" },
            secondary: { main: "#5F6272" }
        },
        typography: {
            h1: {
                fontSize: 60
            },
            h2: {
                fontSize: 35
            },
            h4: {
                fontSize: 26
            },
            body1: {
                fontSize: 22
            }
        },
        components: {
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: "#30313d",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 6px rgba(0, 0, 0, 0.25)",
                        transition: "background 0.15s ease, border 0.15s ease, box-shadow 0.15s ease, color 0.15s ease, outline 0.15s ease",
                        overflow: "hidden",
                        outline: "0px solid transparent",
                        "&:hover": {
                            backgroundColor: "#30313d",
                            border: "1px solid rgba(255, 255, 255, 0.15)"
                        },
                        "&.Mui-focused": {
                            backgroundColor: "#30313d",
                            borderColor: "#F9F9F9",
                            outline: "2.5px solid rgba(249, 249, 249, 0.20)",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5), 0px 1px 6px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(249, 249, 249, 0.1)"
                        },
                        "&::before, &::after": {
                            display: "none"
                        }
                    },
                    input: {
                        padding: "16px 16px",
                        lineHeight: "1.5",
                        color: "#F9F9F9"
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

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <IceCreamCartProvider>
                        <Routes>
                            <Route path="/" element={<Layout inputRef={inputRef} />}>
                                <Route index element={<Page inputRef={inputRef} />} />
                                <Route path="ice-cream" element={<IceCream />} />
                                <Route path="ice-cream/checkout" element={<Checkout />} />
                                <Route path="ice-cream/checkout/return" element={<Return />} />
                                <Route
                                    path="ice-cream/mailing-list/unsubscribe"
                                    element={<Unsubscribe />}
                                />
                                <Route path="ice-cream/mailing-list" element={<MailingList />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </IceCreamCartProvider>
                </BrowserRouter>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

const Layout = (props: { inputRef: RefObject<HTMLInputElement | null> }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const mdScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isHome = useMatch("/");
    const smallScreenPadding = isHome ? 0 : 3;
    return (
        <Box
            width={"100vw"}
            height={"100vh"}
            sx={{
                p: smallScreen ? smallScreenPadding : 8,
                ...(smallScreen && { pt: 4, pb: 4 }),
                boxSizing: "border-box",
                overflow: isHome ? "hidden" : undefined
            }}
            onClick={() => props.inputRef?.current && props.inputRef?.current.focus()}
        >
            {!mdScreen && <LinksAndMenu />}
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowY: isHome ? "scroll" : undefined
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default App;
