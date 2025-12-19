import { Avatar, Grid } from "@mui/material";

import SmallProfile from "../../assets/images/small-profile.webp";
import { MobileSocialButtonList } from "./SocialButtons";

const MobileLayout = () => {
    return (
        <Grid
            container
            direction={"column"}
            justifyContent={"space-betweeen"}
            alignItems={"center"}
            sx={{ width: "100dvw", height: "100dvh" }}
            spacing={6}
        >
            <Grid></Grid>
            <Grid>
                <Avatar alt="Max Rosoff" src={SmallProfile} sx={{ width: 200, height: 200 }} />
            </Grid>
            <Grid>
                <MobileSocialButtonList />
            </Grid>
        </Grid>
    );
};

export default MobileLayout;
