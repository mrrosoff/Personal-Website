import { Box, Divider, Skeleton, type SxProps, type Theme, Typography } from "@mui/material";
import type { CSSObject } from "@mui/material/styles";
import { useCheckout } from "@stripe/react-stripe-js/checkout";

import type { DatabaseFlavor } from "../../../../../api/types";
import { skeletonSx } from "./PaymentFields";

function lineItemAmount(state: ReturnType<typeof useCheckout>, name: string): string {
    if (state.type !== "success") {
        return "";
    }
    return state.checkout.lineItems.find((item) => item.name === name)?.unitAmount.amount ?? "";
}

type OrderLinesProps = {
    flavors: DatabaseFlavor[];
    smallScreen: boolean;
    nameSx?: SxProps<Theme>;
    priceSx?: CSSObject;
};

const OrderLines = (props: OrderLinesProps) => {
    const state = useCheckout();
    return props.flavors.map((flavor, index) => (
        <Box key={flavor.priceId}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    alignItems: "center",
                    py: props.smallScreen ? 1.5 : 2
                }}
            >
                <Typography color={flavor.color || "white"} noWrap sx={props.nameSx}>
                    {flavor.name}
                </Typography>
                <Typography sx={{ flexShrink: 0, ...props.priceSx }}>
                    {lineItemAmount(state, flavor.name) || <Skeleton width={56} sx={skeletonSx} />}
                </Typography>
            </Box>
            {index < props.flavors.length - 1 && <Divider />}
        </Box>
    ));
};

export const orderBoxSx = (smallScreen: boolean) => ({
    border: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 1,
    px: smallScreen ? 2 : 3
});

export default OrderLines;
