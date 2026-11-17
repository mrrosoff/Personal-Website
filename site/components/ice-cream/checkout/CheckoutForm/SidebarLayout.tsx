import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";

import { useCheckoutForm } from "./CheckoutFormContext";
import ContactFields from "./ContactFields";
import OrderLines, { orderBoxSx } from "./OrderLines";
import { LoadingPaymentElement, PayButton } from "./PaymentFields";

const SidebarLayout = () => {
    const { selectedFlavors, setPaymentComplete } = useCheckoutForm();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    return (
        <Box pb={4}>
            <Typography variant={"h1"} mb={3}>
                Checkout
            </Typography>
            <Grid
                container
                spacing={smallScreen ? 4 : 6}
                direction={smallScreen ? "column-reverse" : "row"}
            >
                <Grid size={{ xs: 12, md: 7 }}>
                    <ContactFields />
                    <Typography variant={"h2"} mt={4} mb={2}>
                        Payment
                    </Typography>
                    <LoadingPaymentElement
                        accordion={smallScreen}
                        onComplete={setPaymentComplete}
                    />
                    <PayButton />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: smallScreen ? undefined : 400 }}>
                    <Typography variant={"h2"} mb={2}>
                        Your Order
                    </Typography>
                    <Box sx={orderBoxSx(smallScreen)}>
                        <OrderLines
                            flavors={selectedFlavors}
                            smallScreen={smallScreen}
                            nameSx={{ fontSize: smallScreen ? "1.2rem" : "1.5rem" }}
                            priceSx={{ fontSize: "1.2rem" }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SidebarLayout;
