import React from "react";

import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

import {SnackbarProvider, useSnackbar} from 'notistack';

import Layout from './Layout'

const LoadApp = () =>
{
	const {enqueueSnackbar} = useSnackbar();
	const produceSnackBar = (message, variant = "error") => enqueueSnackbar(message, {variant: variant});

	return <Layout produceSnackBar={produceSnackBar}/>;
};

const App = () =>
{
	const theme = createMuiTheme({
		palette: {
			type: 'dark',
			primary: {main: '#2BC903'},
			secondary: {main: '#0B8AAD'}
		}
	});

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline/>
			<SnackbarProvider maxSnack={3} preventDuplicate>
				<LoadApp/>
			</SnackbarProvider>
		</ThemeProvider>
	);
};

export default App;
