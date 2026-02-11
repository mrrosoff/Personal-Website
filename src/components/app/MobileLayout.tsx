import { useEffect, useState } from "react";
import { Avatar, Grid } from "@mui/material";

import SmallProfile from "../../images/small-profile.webp";
import { MobileSocialButtonList } from "./SocialButtons";

const MobileLayout = () => {
    const [avatarSize, setAvatarSize] = useState<number>(200);

    useEffect(() => {
        function handleResize() {
            const smallHeight = window.innerHeight < 620;
            setAvatarSize(smallHeight ? 150 : 200);
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <Grid
            container
            direction={"column"}
            justifyContent={"space-around"}
            alignItems={"center"}
            sx={{ width: "100dvw", height: "90dvh", minHeight: 500 }}
        >
            <Grid>
                <Avatar
                    alt="Max Rosoff"
                    src={SmallProfile}
                    sx={{ width: avatarSize, height: avatarSize, fetchPriority: "high" }}
                />
            </Grid>
            <Grid>
                <MobileSocialButtonList />
            </Grid>
        </Grid>
    );
};

export default MobileLayout;
