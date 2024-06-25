import { useEffect, useRef } from "react";
import {
    createBrowserRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useLocation,
    useNavigate
} from "react-router-dom";

import { Box } from "@mui/material";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import MobileLayout from "./app/MobileLayout";
import DesktopLayout, { Page } from "./app/DesktopLayout";
import IceCream from "./ice-cream/IceCream";

const App = () => {
    const inputRef: any = useRef(null);

    const theme = createTheme({
        palette: {
            mode: "dark",
            primary: { main: "#2BC903" },
            secondary: { main: "#0B8AAD" }
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
    return (
        <>
            <Box sx={{ display: { md: "none", xs: "block" } }}>
                <MobileLayout />
            </Box>
            <Box sx={{ display: { md: "block", xs: "none" } }}>
                <DesktopLayout inputRef={props.inputRef} />
            </Box>
        </>
    );
};

export default App;
