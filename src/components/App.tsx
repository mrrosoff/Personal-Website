import { useEffect, useRef } from "react";
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

const App = () => {
    const inputRef: any = useRef(null);

    const theme = createTheme({
        palette: {
            mode: "dark",
            primary: { main: "#2BC903" },
            secondary: { main: "#0B8AAD" }
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

const Layout = (props: { inputRef: { current: { focus: () => any } } }) => {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isHome = useMatch("/");
    return (
        <Box
            width={"100vw"}
            height={"100vh"}
            sx={{
                p: smallScreen && isHome ? 0 : 8,
                width: "100%",
                height: "100%",
                overflow: "hidden"
            }}
            onClick={() => props.inputRef.current && props.inputRef.current.focus()}
        >
            {!smallScreen && <LinksAndMenu />}
            <Box sx={{ width: "100%", height: "100%", overflowY: "scroll" }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default App;
