import React from 'react';

import {Avatar, Button, Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import GitHubIcon from '@material-ui/icons/GitHub';

import Profile from '../static/images/profile.jpg';

const useStyles = makeStyles((theme) => ({
	largeAvatar: {
		width: theme.spacing(25),
		height: theme.spacing(25)
	}
}));

const MobileLayout = props =>
{
	const classes = useStyles();
	return (
		<Grid container direction={'column'} style={{width: '100vw', height: '100vh'}}
			  justify={'center'} alignItems={'center'} alignContent={'center'}
		>
			<Grid item container direction={'column'} spacing={8}
				  justify={'center'} alignItems={'center'} alignContent={'center'}
			>
				<Grid item>
					<Avatar
						alt="Max Rosoff"
						src={Profile}
						className={classes.largeAvatar}
					/>
				</Grid>
				<Grid item>
					<Grid container direction={'column'} spacing={1}
						  justify={'center'} alignItems={'center'} alignContent={'center'}
					>
						<Grid item>
							<LinkButtonWithIcon href={'https://www.facebook.com/maxr.rosoff'}
												icon={<FacebookIcon/>}>
								Facebook
							</LinkButtonWithIcon>
						</Grid>
						<Grid item>
							<LinkButtonWithIcon href={'https://www.instagram.com/thenameismr.r/'}
												icon={<InstagramIcon/>}>
								Instagram
							</LinkButtonWithIcon>
						</Grid>
						<Grid item>
							<LinkButtonWithIcon href={'https://www.linkedin.com/in/max-rosoff'}
												icon={<LinkedInIcon/>}>
								LinkedIn
							</LinkButtonWithIcon>
						</Grid>
						<Grid item>
							<LinkButtonWithIcon href={'https://www.github.com/mrrosoff'} icon={<GitHubIcon/>}>
								GitHub
							</LinkButtonWithIcon>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export const LinkButtonWithIcon = props =>
{
	return (
		<Button
			href={props.href}
			target={'_blank'}
			rel={'noopener'}
			className={props.className ? props.className : ''}
			startIcon={props.icon}
			size={'large'}
		>
			{props.children}
		</Button>
	);
};

export default MobileLayout;
