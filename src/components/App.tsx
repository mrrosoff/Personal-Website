import { Hidden } from "@mui/material";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import MobileLayout from "./app/MobileLayout";
import DesktopLayout from "./app/DesktopLayout";

const App = () => {
	const theme = createTheme({
		palette: {
			mode: "dark",
			primary: { main: "#2BC903" },
			secondary: { main: "#0B8AAD" }
		}
	});

	return (
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Hidden mdUp>
					<MobileLayout />
				</Hidden>
				<Hidden mdDown>
					<DesktopLayout />
				</Hidden>
			</ThemeProvider>
		</StyledEngineProvider>
	);
};

export default App;
