import React, {useState} from 'react';

import clsx from 'clsx';
import makeStyles from "@material-ui/core/styles/makeStyles";

import {Card, CardActions, CardMedia, Grid, IconButton, Typography} from '@material-ui/core';

import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkedInIcon from '@material-ui/icons/LinkedIn'
import GitHubIcon from '@material-ui/icons/GitHub';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import LinkButton from "./LinkButton";
import CollapseArea from "./CollapseArea";

import Profile from '../static/images/profile.jpg';

const useStyles = makeStyles(theme => ({
	card: { [theme.breakpoints.up('xs')]: { width: '90vw' },
		[theme.breakpoints.up('sm')]: { width: '75vw' },
		[theme.breakpoints.up('md')]: { width: "55vw" },
		[theme.breakpoints.up('lg')]: { width: "55vw" }
	},
	media: { [theme.breakpoints.up('xs')]: { height: '65vh' },
		[theme.breakpoints.up('sm')]: { height: '60vh' },
		[theme.breakpoints.up('md')]: { height: "60vh" },
		[theme.breakpoints.up('lg')]: { height: "60vh" }
	},
	name: {paddingLeft: '10px'},
	right: {marginLeft: 'auto'},
	expand: {
		transform: 'rotate(0deg)',
		transition: theme.transitions.create('transform', {duration: theme.transitions.duration.shortest}),
	},
	expandOpen: {transform: 'rotate(180deg)'},
}));

const Layout = props =>
{
	const classes = useStyles();
	const [expanded, setExpanded] = useState(false);

	const handleExpandClick = () => setExpanded(!expanded);
	const OS = getOS(props.produceSnackBar);

	let collapseArea = <CollapseArea expanded={expanded} OS={OS} produceSnackbar={props.produceSnackBar}/>;
	let renderMore = true;

	if (OS === "iOS" || OS === "Android")
	{
		collapseArea = null;
		renderMore = false;
	}

	return (
		<>
			<Grid container
				  justify={'center'}
				  alignItems={'center'}
				  alignContent={'center'}
				  style={{height: '100vh'}}
			>
				<Grid item>
					<Card className={classes.card}>
						<CardMedia image={Profile} title={'Max Rosoff'} className={classes.media}/>
						<Buttons renderMore={renderMore} expanded={expanded} handleExpandClick={handleExpandClick}/>
						{collapseArea}
					</Card>
				</Grid>
			</Grid>
			<div style={{
				position: 'absolute',
				top: '0px', right: '0px',
				width: '30px', height: '30px',
			}} onClick={() => confetti.toggle()}/>
		</>
	);
};

const Buttons = props =>
{
	const classes = useStyles();

	const More = props.renderMore ?

		<IconButton
			onClick={props.handleExpandClick}
			className={clsx(classes.expand, {[classes.expandOpen]: props.expanded})}
		>
			<ExpandMoreIcon/>
		</IconButton>

		: null;

	return (
		<CardActions disableSpacing>
			<Typography variant={'h6'} className={classes.name}>Max Rosoff</Typography>
			<LinkButton href={"https://www.facebook.com/max.rosoff.75"} icon={<FacebookIcon />}
						className={classes.right}/>
			<LinkButton href={"https://www.instagram.com/thenameismr.r/"} icon={<InstagramIcon />}/>
			<LinkButton href={"https://www.linkedin.com/in/max-rosoff"} icon={<LinkedInIcon />}/>
			<LinkButton href={"https://www.github.com/mrrosoff"} icon={<GitHubIcon />}/>
			{More}
		</CardActions>
	);
};

const getOS = (produceSnackbar) =>
{
	let userAgent = window.navigator.userAgent;
	let platform = window.navigator.platform;

	let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
	let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
	let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
	let os = null;

	if(macosPlatforms.indexOf(platform) !== -1)
	{
		os = 'Mac OS';
	}

	else if(iosPlatforms.indexOf(platform) !== -1)
	{
		os = 'iOS';
	}

	else if(windowsPlatforms.indexOf(platform) !== -1)
	{
		os = 'Windows';
	}

	else if(/Android/.test(userAgent))
	{
		os = 'Android';
	}

	else if(/Linux/.test(platform))
	{
		os = 'Linux';
	}

	else
	{
		produceSnackbar("You are using an unspecified platform. Some effects may not operate correctly.", "warning")
	}

	return os;
};

export default Layout;
