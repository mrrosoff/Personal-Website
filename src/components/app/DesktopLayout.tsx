import { useRef, useState } from "react";

import { Avatar, Box, Paper } from "@mui/material";

import { DesktopSocialButtonList } from "./SocialButtons";

import Profile from "../../assets/images/profile.jpg";

import BootUp from "./desktop/BootUp";
import TerminalEmbed from "./desktop/TerminalEmbed";

const DesktopLayout = () => {
	const [bootingUp, setBootingUp] = useState(import.meta.env.DEV);

	let inputRef: any = useRef(null);

	const creationDate = new Date();
	creationDate.setMinutes(creationDate.getMinutes() - 8);
	creationDate.setHours(creationDate.getHours() - 2);
	creationDate.setDate(creationDate.getDate() - 5);

	return (
		<Box width={"100vw"} height={"100vh"}>
			<Box
				sx={{ p: 8, width: "100%", height: "100%", overflow: "hidden" }}
				onClick={() => inputRef.current && inputRef.current.focus()}
			>
				<LinksAndMenu />
				<Box sx={{ width: "100%", height: "100%", overflowY: "scroll" }}>
					{bootingUp ? (
						<BootUp
							setBootingUp={setBootingUp}
							creationDate={creationDate.toString()}
						/>
					) : (
						<TerminalEmbed ref={inputRef} />
					)}
				</Box>
			</Box>
		</Box>
	);
};

const LinksAndMenu = () => {
	const [open, setOpen] = useState(false);
	return (
		<Box sx={{ position: "relative" }}>
			<Links open={open} setOpen={setOpen} />
			<Box sx={{ position: "absolute", top: 65, right: 0 }}>
				{open && (
					<Paper style={{ width: 310 }}>
						<DesktopSocialButtonList />
					</Paper>
				)}
			</Box>
			<Avatar
				alt="Max Rosoff"
				src={Profile}
				onClick={() => setOpen(!open)}
				style={{
					width: 45,
					height: 45,
					borderStyle: "solid",
					borderWidth: "1px",
					borderColor: "#FFFFFF",
					position: "absolute",
					top: 0,
					right: 0
				}}
			/>
		</Box>
	);
};

const Links = (props: any) => {
	return (
		<Box sx={{ position: "absolute", top: 0, right: 80, display: "flex" }}>
			<a
				href={"https://github.com/mrrosoff/Personal-Website"}
				target="_blank"
				style={{ paddingRight: 20, color: "#FCFCFC", fontSize: 20 }}
			>
				Source
			</a>
			<a
				style={{ margin: 0, color: "#FCFCFC", fontSize: 20 }}
				onClick={() => props.setOpen(!props.open)}
			>
				More
			</a>
		</Box>
	);
};

export default DesktopLayout;
