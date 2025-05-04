import { RefObject, useEffect, useRef } from "react";
import {
    createBrowserRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useLocation,
    useMatch,
    useNavigate
} from "react-router-dom";

import { Box, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider, StyledEngineProvider, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Page, { LinksAndMenu } from "./app/Page";
import IceCream from "./ice-cream/IceCream";
import MailingList from "./ice-cream/MailingList";

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

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Router404Inject />,
            errorElement: <Navigate to="/" replace={true} />,
            children: [
                {
                    element: <Layout inputRef={inputRef} />,
                    children: [
                        {
                            index: true,
                            element: <Page inputRef={inputRef} />
                        },
                        {
                            path: "ice-cream",
                            element: <IceCream />
                        },
                        {
                            path: "mailing-list",
                            element: <MailingList />
                        }
                    ]
                }
            ]
        }
    ]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

const Router404Inject = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const splitPath = location.search.split("/");
        if (splitPath[0] === "?") {
            navigate(splitPath[1]);
        }
    }, [location]);

    return <Outlet />;
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
                overflow: "hidden"
            }}
            onClick={() => props.inputRef?.current && props.inputRef?.current.focus()}
        >
            {!mdScreen && <LinksAndMenu />}
            <Box sx={{ width: "100%", height: "100%", overflowY: "scroll" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default App;
