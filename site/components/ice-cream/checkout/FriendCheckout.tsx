import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { validate } from "email-validator";
import { Box, Button, Divider, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";

import { API_ENDPOINT_URL } from "../../../../api/types";
import FormField, { emailProblem } from "../../FormField";
import { decodeToken } from "../../../auth";
import { useIceCreamCart } from "../IceCreamCartContext";
import { rainbowTextSx } from "../IceCream";

type FriendCheckoutProps = {
    priceIds: string[];
    friendToken: string;
};

const FriendCheckout = ({ priceIds, friendToken }: FriendCheckoutProps) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const { flavors, loadFlavors } = useIceCreamCart();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        void loadFlavors();
    }, []);

    const selectedFlavors = flavors.filter((flavor) => priceIds.includes(flavor.priceId));

    const onSubmit = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            await axios.post(
                `${API_ENDPOINT_URL}/ice-cream/checkout?priceIds=${priceIds.join(",")}`,
                { email },
                { headers: { Authorization: `Bearer ${friendToken}` } }
            );
            await navigate("/ice-cream/checkout/return");
        } catch {
            setMessage("Checkout Failed");
            setIsLoading(false);
        }
    };

    const friendName = decodeToken(friendToken)?.id;
    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={2}>
                Checkout
            </Typography>
            <Typography variant={"body1"} mb={3}>
                Thanks for being a friend,{" "}
                <Typography component={"span"} sx={{ fontSize: "inherit", ...rainbowTextSx }}>
                    {friendName}
                </Typography>
                . This one's on me.
            </Typography>
            <Grid
                container
                spacing={smallScreen ? 4 : 2}
                direction={smallScreen ? "column-reverse" : "row"}
            >
                <Grid size={{ xs: 12, md: 6 }} sx={{ pr: smallScreen ? 0 : 10 }}>
                    <Typography variant={"h2"} mb={2}>
                        Contact Info
                    </Typography>
                    <FormField
                        label={"Email"}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        problem={emailProblem}
                        placeholder={"karl@fog.sf"}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant={"h2"} mb={2}>
                        Your Order
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: 1,
                            px: smallScreen ? 2 : 3
                        }}
                    >
                        {selectedFlavors.map((flavor, index) => (
                            <Box key={flavor.priceId}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        alignItems: "center",
                                        py: smallScreen ? 1.5 : 2
                                    }}
                                >
                                    <Typography color={flavor.color || "white"} noWrap>
                                        {flavor.name}
                                    </Typography>
                                    <Typography sx={{ ...rainbowTextSx, flexShrink: 0 }}>
                                        $0.00
                                    </Typography>
                                </Box>
                                {index < selectedFlavors.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Button
                color={"primary"}
                variant={"contained"}
                size={"large"}
                fullWidth
                disabled={isLoading || !validate(email)}
                loading={isLoading}
                onClick={() => void onSubmit()}
                sx={{
                    mt: 4,
                    fontSize: 20,
                    backgroundColor: "#52535F",
                    color: "white",
                    ":hover": { backgroundColor: "#5F6272" }
                }}
            >
                Complete Order
            </Button>
            {message && <Typography mt={2}>{message}</Typography>}
        </Box>
    );
};

export default FriendCheckout;
