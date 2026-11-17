import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useMatch } from "react-router-dom";

import { Box, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AppProvider } from "./AppContext";
import { IceCreamCartProvider } from "./ice-cream/IceCreamCartContext";
import IceCream from "./ice-cream/IceCream";
import MailingList from "./ice-cream/MailingList";
import Unsubscribe from "./ice-cream/Unsubscribe";
import Return from "./ice-cream/checkout/Return";
import PrivacyPolicy from "./PrivacyPolicy";
import RegisterFriend from "./RegisterFriend";
import SpotifyCallback from "./SpotifyCallback";
import Page, { LinksAndMenu } from "./app/Page";
import { createMuiTheme } from "../theme";

const Checkout = lazy(() => import("./ice-cream/checkout/Checkout"));
const CancelSubscription = lazy(() => import("./ice-cream/CancelSubscription"));
const Polaroid = lazy(() => import("./polaroid/Polaroid"));

const muiTheme = createMuiTheme();

const App = () => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <BrowserRouter>
                    <AppProvider>
                        <IceCreamCartProvider>
                            <AppRoutes />
                        </IceCreamCartProvider>
                    </AppProvider>
                </BrowserRouter>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

const AppRoutes = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    return (
        <Routes>
            <Route
                path="/"
                element={<Layout inputRef={inputRef} scrollContainerRef={scrollContainerRef} />}
            >
                <Route
                    index
                    element={<Page inputRef={inputRef} scrollContainerRef={scrollContainerRef} />}
                />
                <Route path="ice-cream" element={<IceCream />} />
                <Route path="ice-cream/checkout" element={<Checkout />} />
                <Route path="ice-cream/checkout/return" element={<Return />} />
                <Route path="ice-cream/cancel" element={<CancelSubscription />} />
                <Route path="ice-cream/mailing-list/unsubscribe" element={<Unsubscribe />} />
                <Route path="ice-cream/mailing-list" element={<MailingList />} />
                <Route path="polaroid" element={<Polaroid />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="register-friend" element={<RegisterFriend />} />
                <Route path="spotify/callback" element={<SpotifyCallback />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

type LayoutProps = {
    inputRef: RefObject<HTMLInputElement | null>;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
};

const Layout = ({ inputRef, scrollContainerRef }: LayoutProps) => {
    const theme = useTheme();
    const mdScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isHome = useMatch("/");

    const [screenBottomPadding, setBottomScreenPadding] = useState<number>(4);

    useEffect(() => {
        function handleResize() {
            const height = window.visualViewport?.height ?? window.innerHeight;
            const smallHeight = height < 620;
            setBottomScreenPadding(smallHeight ? 0 : 4);
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        window.visualViewport?.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.visualViewport?.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <Box
            component="main"
            sx={{
                height: "100dvh",
                p: mdScreen ? (isHome ? 2 : 3) : 6,
                ...(mdScreen ? { pt: 4, pb: screenBottomPadding } : { pb: 3 }),
                boxSizing: "border-box",
                overflow: isHome ? "hidden" : undefined
            }}
            onClick={() => {
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed) return;
                inputRef.current?.focus();
            }}
        >
            {(!mdScreen || isHome) && <LinksAndMenu />}
            <Box
                ref={scrollContainerRef}
                sx={{
                    width: "100%",
                    height: "100%",
                    overflowY: isHome ? "auto" : undefined,
                    ...(mdScreen &&
                        isHome && {
                            "& *": { overflowWrap: "break-word" },
                            "& a": { wordBreak: "break-all" }
                        })
                }}
            >
                <Suspense fallback={null}>
                    <Outlet />
                </Suspense>
            </Box>
        </Box>
    );
};

export default App;
