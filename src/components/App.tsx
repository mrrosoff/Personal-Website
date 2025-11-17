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
            secondary: { main: "#2BC903" }
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
    const isIceCream = useMatch("/ice-cream");
    const smallScreenPadding = isHome ? 0 : 3;
    return (
        <Box
            width={"100vw"}
            height={"100vh"}
            sx={{
                p: smallScreen ? smallScreenPadding : 8,
                ...(smallScreen && { pt: 4, pb: 4 }),
                boxSizing: "border-box",
                overflow: !isIceCream ? "hidden" : undefined
            }}
            onClick={() => props.inputRef?.current && props.inputRef?.current.focus()}
        >
            {!mdScreen && <LinksAndMenu />}
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowY: !isIceCream ? "scroll" : undefined
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default App;
