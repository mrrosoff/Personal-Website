import { Avatar, Grid } from "@mui/material";

import Profile from "../../assets/images/profile.jpg";
import { MobileSocialButtonList } from "./SocialButtons";

const MobileLayout = () => {
	return (
        <Grid
            container
            direction={"column"}
            style={{ width: "100vw", height: "100vh" }}
            justifyContent={"center"}
            alignItems={"center"}
            alignContent={"center"}
        >
            <Grid
                item
                container
                direction={"column"}
                spacing={6}
                justifyContent={"center"}
                alignItems={"center"}
                alignContent={"center"}
            >
                <Grid item>
                    <Avatar
                        alt="Max Rosoff"
                        src={Profile}
                        sx={{ width: 200, height: 200 }}
                    />
                </Grid>
                <Grid item>
                    <MobileSocialButtonList />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default MobileLayout;
