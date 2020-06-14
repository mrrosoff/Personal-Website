import React from "react";

import {Button, CardContent, Container, Collapse, Grid, Typography} from "@material-ui/core";

const CollapseArea = props =>
{
	return (
		<Collapse in={props.expanded} timeout="auto" unmountOnExit>
			<CardContent>
				<Container>
					<InternalGrid OS={props.OS} produceSnackbar={props.produceSnackbar}/>
				</Container>
			</CardContent>
		</Collapse>
	);
};

const InternalGrid = props =>
{
	return (
		<Grid container
			  justify={'center'}
			  alignItems={'center'}
			  alignContent={'center'}
			  spacing={3}
		>
			<Grid item xs={12}>
				<Typography variant={'h6'} align={'center'} gutterBottom>Project Explorer</Typography>
				<Typography variant={'body2'} align={'center'}>
					View my projects! With this interactive client built on the Electron framework, you can demo some
					of my creations at home! This explorer showcases a live demo, but to view the source code for my
					projects, check out my GitHub page.
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<ClientOptions {...props}/>
			</Grid>
		</Grid>
	)
};

const ClientOptions = props =>
{
	let OS = props.OS;

	let notReadyMessage = "This Feature Will Be Available In A Future Release.";
	let makeNotReadyMessage = () => props.produceSnackbar(notReadyMessage, "info");

	return (
		<Grid container
			  justify={'center'}
			  alignItems={'center'}
			  alignContent={'center'}
			  spacing={2}
		>
			{
				OS === "Linux" ?
					<Grid item>
						<GreenButton
							text={`Download the Debian Client`}
							onClick={() => downloadClient('Debian', makeNotReadyMessage)}
						/>
					</Grid> :
					<Grid item>
						<GreenButton
							text={`Download the ${OS} Client`}
							onClick={() => downloadClient(OS, makeNotReadyMessage)}
						/>
					</Grid>
			}
			{
				OS === "Linux" ?
					<Grid item>
						<GreenButton
							text={`Download the Red Hat Client`}
							onClick={() => downloadClient('Red Hat', makeNotReadyMessage)}
						/>
					</Grid> : null
			}

		</Grid>
	);
};

const GreenButton = props =>
{
	return <Button variant="contained" color={"primary"} size={'small'} onClick={props.onClick}>{props.text}</Button>
};

const downloadClient = (OS, makeNotReadyMessage) =>
{
	if (OS === "Debian")
	{
		doDownload("https://github.com/mrrosoff/Personal-Website/raw/master/static/installers/project-explorer_1.0.0_amd64.deb");
	}

	if (OS === "Red Hat")
	{
		doDownload("https://github.com/mrrosoff/Personal-Website/raw/master/static/installers/project-explorer-1.0.0-1.x86_64.rpm");
	}

	else
	{
		makeNotReadyMessage();
	}
};

const doDownload = (link) =>
{
	let a = document.createElement('a');
	a.href = link;
	a.download = 'project-explorer.deb';
	document.body.appendChild(a);
	a.click();
	setTimeout(() => document.body.removeChild(a), 0);
};

export default CollapseArea;
