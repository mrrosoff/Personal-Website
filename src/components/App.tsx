import { useRef } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

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
            element: <Layout inputRef={inputRef} />,
            errorElement: <ErrorPage />,
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

const ErrorPage = () => {
    return <Navigate to="/" replace={true} />;
};

export default App;
