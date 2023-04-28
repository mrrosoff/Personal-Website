import { Box, Button, Grid, Typography } from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

const socialList = [
    {
        name: "Resume",
        url: "https://bit.ly/rosoff-resume",
        icon: DescriptionIcon
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/max-rosoff",
        icon: LinkedInIcon
    },
    {
        name: "GitHub",
        url: "https://www.github.com/mrrosoff",
        icon: GitHubIcon
    },
    {
        name: "Facebook",
        url: "https://www.facebook.com/maxr.rosoff",
        icon: FacebookIcon
    },
    {
        name: "Instagram",
        url: "https://www.instagram.com/thenameismr.r/",
        icon: InstagramIcon
    },
    {
        name: "Twitter",
        url: "https://twitter.com/MrRosoff",
        icon: TwitterIcon
    }
];

const contactList = [
    {
        name: "Email",
        url: "mailto:me@maxrosoff.com",
        icon: EmailIcon
    }
];

export const DesktopSocialButtonList = (props: { sx?: any }) => {
    return (
        <Box p={2} sx={props.sx} display={"flex"} flexWrap={"wrap"}>
            {socialList.map((socialDetails, index) => {
                return (
                    <Box key={index} mr={1}>
                        <CustomIconButton
                            href={socialDetails.url}
                            icon={socialDetails.icon}
                            text={socialDetails.name}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

export const MobileSocialButtonList = () => {
    return (
        <Grid
            container
            direction={"column"}
            spacing={1}
            justifyContent={"center"}
            alignItems={"center"}
            alignContent={"center"}
        >
            {socialList.map((socialDetails, index) => (
                <Grid item key={index}>
                    <CustomIconButton
                        href={socialDetails.url}
                        icon={socialDetails.icon}
                        text={socialDetails.name}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export const ContactButtonList = (props: { sx?: any }) => {
    return (
        <Box p={2} sx={props.sx} display={"flex"} flexWrap={"wrap"}>
            {contactList.map((socialDetails, index) => {
                return (
                    <Box key={index} mr={1}>
                        <CustomIconButton
                            href={socialDetails.url}
                            icon={socialDetails.icon}
                            text={socialDetails.name}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

const CustomIconButton = (props: any) => {
    const Icon = props.icon;
    return (
        <Button
            className={"social-button"}
            href={props.href}
            target={"_blank"}
            rel={"noopener"}
            size={"large"}
            {...props}
        >
            <Box sx={{ display: "flex", alignItems: "center", color: "white" }}>
                <Icon />
                <Box pl={2}>
                    <Typography>{props.text}</Typography>
                </Box>
            </Box>
        </Button>
    );
};
