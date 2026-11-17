import { Box, Button, IconButton, Typography } from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";

const socialList = [
    {
        name: "Résumé",
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

export const DesktopSocialButtonList = () => {
    return (
        <Box sx={{ p: 2, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {socialList.map((socialDetails, index) => {
                return (
                    <Box key={index} sx={{ mr: 1 }}>
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

const CustomIconButton = (props: {
    icon: React.ElementType;
    href: string;
    text: string;
    social?: boolean;
}) => {
    const Icon = props.icon;
    const ButtonType: React.ElementType = props.social ? IconButton : Button;
    return (
        <ButtonType
            className={"social-button"}
            href={props.href}
            target={"_blank"}
            rel={"noopener"}
            size={"large"}
            aria-label={props.social ? props.text : undefined}
        >
            <Box sx={{ display: "flex", alignItems: "center", color: "white" }}>
                <Icon />
                {!props.social && (
                    <Box sx={{ pl: 2 }}>
                        <Typography>{props.text}</Typography>
                    </Box>
                )}
            </Box>
        </ButtonType>
    );
};
