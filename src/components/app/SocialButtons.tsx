import { Box, Button, Grid, IconButton, SxProps, Theme, Typography } from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import IcecreamIcon from "@mui/icons-material/Icecream";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import { useNavigate } from "react-router-dom";

const socialList = [
    {
        name: "Resume",
        url: "https://docs.google.com/document/d/1Uo8gSufMpN4ELAqIEYm6zDiLB6f-bbuES9xcQPcX1_c/edit?usp=sharing",
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

export const DesktopSocialButtonList = (props: { sx?: SxProps<Theme> | undefined }) => {
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
            {socialList.slice(1).map((socialDetails, index) => (
                <Grid key={index}>
                    <CustomIconButton
                        href={socialDetails.url}
                        icon={socialDetails.icon}
                        text={socialDetails.name}
                    />
                </Grid>
            ))}
            <Grid>
                <CustomIconButton
                    href={"ice-cream"}
                    icon={IcecreamIcon}
                    text={"Ice Cream"}
                    isLink={true}
                />
            </Grid>
            <Grid>
                <CustomIconButton
                    href={"mailing-list"}
                    icon={MarkunreadMailboxIcon}
                    text={"Mailing List"}
                    isLink={true}
                />
            </Grid>
        </Grid>
    );
};

const CustomIconButton = (props: {
    icon: React.ElementType;
    href: string;
    text: string;
    social?: boolean;
    isLink?: boolean;
}) => {
    const navigate = useNavigate();
    const Icon = props.icon;
    const ButtonType: React.ElementType = props.social ? IconButton : Button;
    return (
        <ButtonType
            className={"social-button"}
            href={props.isLink ? undefined : props.href}
            target={props.isLink ? undefined : "_blank"}
            rel={props.isLink ? undefined : "noopener"}
            size={"large"}
            onClick={props.isLink ? () => navigate(props.href) : undefined}
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
