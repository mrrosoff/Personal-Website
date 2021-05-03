import React, { useRef, useState } from "react";

import { Avatar, Box, Button, Grid, Paper } from "@material-ui/core";

import { useSnackbar } from "notistack";

import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import GitHubIcon from "@material-ui/icons/GitHub";
import GetAppIcon from "@material-ui/icons/GetApp";

import Profile from "../static/images/profile.jpg";

import BootUp from "./BootUp";
import TerminalEmbed from "./TerminalEmbed";

const DesktopLayout = (props) => {
	const [bootingUp, setBootingUp] = useState(true);
	const [open, setOpen] = useState(false);

	let inputRef = useRef();

	return (
		<Box width={"100vw"} height={"100vh"}>
			<Box
				p={8}
				style={{ width: "100%", height: "100%", overflow: "hidden" }}
				onClick={() => inputRef.current.focus()}
			>
				<div style={{ position: "relative" }}>
					<Grid
						container
						style={{ position: "absolute", top: 0, right: 0 }}
						direction={"column"}
						justify={"flex-end"}
						alignItems={"flex-end"}
						spacing={2}
					>
						<Grid item>
							<Avatar alt="Max Rosoff" src={Profile} onClick={() => setOpen(!open)} />
						</Grid>
						{open ? (
							<Grid item>
								<UserCard open={open} {...props} />
							</Grid>
						) : null}
					</Grid>
				</div>
				<div style={{ width: "100%", height: "100%", overflowY: "scroll" }}>
					{bootingUp ? (
						<BootUp setBootingUp={setBootingUp} />
					) : (
						<TerminalEmbed ref={inputRef} />
					)}
				</div>
			</Box>
		</Box>
	);
};

const UserCard = (props) => {
	return (
		<Paper elevation={3} style={{ width: 350, height: 265 }}>
			<Box p={3} style={{ position: "relative", height: "100%" }}>
				<Buttons {...props} />
			</Box>
		</Paper>
	);
};

const Buttons = (props) => {
	const { enqueueSnackbar } = useSnackbar();
	const OS = getOS(enqueueSnackbar);
	let makeNotReadyMessage = () =>
		enqueueSnackbar("This Feature Will Be Available In A Future Release", "info");

	return (
		<Grid container alignContent={"center"} style={{ height: "100%" }}>
			<Grid item>
				<Grid container spacing={1}>
					{OS === "Linux" ? (
						<>
							<Grid item>
								<Button
									startIcon={<GetAppIcon />}
									onClick={() => downloadClient("Debian", makeNotReadyMessage)}
								>
									Project Explorer (Debian)
								</Button>
							</Grid>
							<Grid item>
								<Button
									startIcon={<GetAppIcon />}
									onClick={() => downloadClient("Red Hat", makeNotReadyMessage)}
								>
									Project Explorer (Red Hat)
								</Button>
							</Grid>
						</>
					) : (
						<Grid item>
							<Button
								startIcon={<GetAppIcon />}
								onClick={() => downloadClient(OS, makeNotReadyMessage)}
							>
								Project Explorer ({OS})
							</Button>
						</Grid>
					)}
					<Grid item>
						<Grid container spacing={2}>
							<Grid item>
								<LinkButtonWithIcon
									href={"https://www.facebook.com/maxr.rosoff"}
									icon={<FacebookIcon />}
								>
									Facebook
								</LinkButtonWithIcon>
							</Grid>
							<Grid item>
								<LinkButtonWithIcon
									href={"https://www.instagram.com/thenameismr.r/"}
									icon={<InstagramIcon />}
								>
									Instagram
								</LinkButtonWithIcon>
							</Grid>
						</Grid>
						<Grid container spacing={2}>
							<Grid item>
								<LinkButtonWithIcon
									href={"https://www.linkedin.com/in/max-rosoff"}
									icon={<LinkedInIcon />}
								>
									LinkedIn
								</LinkButtonWithIcon>
							</Grid>
							<Grid item>
								<LinkButtonWithIcon
									href={"https://www.github.com/mrrosoff"}
									icon={<GitHubIcon />}
								>
									GitHub
								</LinkButtonWithIcon>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export const LinkButtonWithIcon = (props) => {
	return (
		<Button
			href={props.href}
			target="_blank"
			rel="noopener"
			className={props.className ? props.className : ""}
			startIcon={props.icon}
		>
			{props.children}
		</Button>
	);
};

const getOS = (produceSnackBar) => {
	let userAgent = window.navigator.userAgent;
	let platform = window.navigator.platform;

	let macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
	let windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
	let iosPlatforms = ["iPhone", "iPad", "iPod"];
	let os = null;

	if (macosPlatforms.indexOf(platform) !== -1) {
		os = "Mac OS";
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		os = "iOS";
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = "Windows";
	} else if (/Android/.test(userAgent)) {
		os = "Android";
	} else if (/Linux/.test(platform)) {
		os = "Linux";
	} else {
		produceSnackBar(
			"You are using an unspecified platform. Some effects may not operate correctly.",
			"warning"
		);
	}

	return os;
};

const downloadClient = (OS, makeNotReadyMessage) => {
	let version = "1.7.2";

	if (OS === "Debian") {
		makeNotReadyMessage();
		// doDownload("https://github.com/mrrosoff/Project-Explorer/releases/latest/download/project-explorer_" + version + "_amd64.deb");
	} else if (OS === "Red Hat") {
		makeNotReadyMessage();
		// doDownload("https://github.com/mrrosoff/Project-Explorer/releases/latest/download/project-explorer-" + version + "-1.x86_64.rpm");
	} else if (OS === "Windows") {
		doDownload(
			"https://github.com/mrrosoff/Project-Explorer/releases/latest/download/project-explorer-" +
				version +
				".Setup.exe"
		);
	} else if (OS === "Mac OS") {
		doDownload(
			"https://github.com/mrrosoff/Project-Explorer/releases/latest/download/Project-Explorer.dmg"
		);
	} else {
		makeNotReadyMessage();
	}
};

const doDownload = (link) => {
	let a = document.createElement("a");
	a.href = link;
	a.download = "project-explorer.deb";
	document.body.appendChild(a);
	a.click();
	setTimeout(() => document.body.removeChild(a), 0);
};

export default DesktopLayout;
