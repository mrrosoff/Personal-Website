import { Box, Button, Grid, IconButton, Typography } from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

const socialList = [
    {
        name: "Resume",
        url: "https://bit.ly/rosoff-resume",
        icon: DescriptionIcon
    },
    {
        name: "Email",
        url: "mailto:me@maxrosoff.com",
        icon: EmailIcon
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/max-rosoff",
        icon: LinkedInIcon,
        social: true
    },
    {
        name: "GitHub",
        url: "https://www.github.com/mrrosoff",
        icon: GitHubIcon,
        social: true
    },
    {
        name: "Facebook",
        url: "https://www.facebook.com/maxr.rosoff",
        icon: FacebookIcon,
        social: true
    },
    {
        name: "Instagram",
        url: "https://www.instagram.com/thenameismr.r/",
        icon: InstagramIcon,
        social: true
    }
];

export const DesktopSocialButtonList = (props: { sx?: any }) => {
    return (
        <Box p={2} sx={props.sx} display={"flex"} flexWrap={"wrap"} justifyContent={"center"}>
            {socialList.map((socialDetails, index) => {
                return (
                    <Box key={index} mr={1}>
                        <CustomIconButton
                            href={socialDetails.url}
                            icon={socialDetails.icon}
                            text={socialDetails.name}
                            social={socialDetails.social}
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

const CustomIconButton = (props: any) => {
    const Icon = props.icon;
    const ButtonType = props.social ? IconButton : Button;
    return (
        <ButtonType
            className={"social-button"}
            href={props.href}
            target={"_blank"}
            rel={"noopener"}
            size={"large"}
        >
            <Box sx={{ display: "flex", alignItems: "center", color: "white" }}>
                <Icon />
                {!props.social && (
                    <Box pl={2}>
                        <Typography>{props.text}</Typography>
                    </Box>
                )}
            </Box>
        </ButtonType>
    );
};
