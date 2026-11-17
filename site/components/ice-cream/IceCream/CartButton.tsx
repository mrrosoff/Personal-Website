import { useNavigate } from "react-router-dom";
import { Badge, Fab, useTheme, Zoom } from "@mui/material";
import IcecreamOutlinedIcon from "@mui/icons-material/IcecreamOutlined";

import { useIceCreamCart } from "../IceCreamCartContext";

export default function CartButton() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { selectedPriceIds } = useIceCreamCart();

    const handleCartClick = () => {
        const priceIdsParam = selectedPriceIds.join(",");
        void navigate(`/ice-cream/checkout?priceIds=${priceIdsParam}`);
    };

    return (
        <Zoom
            in={true}
            timeout={theme.transitions.duration.enteringScreen}
            style={{
                transitionDelay: `${theme.transitions.duration.leavingScreen.toString()}ms`
            }}
            unmountOnExit
        >
            <Badge
                badgeContent={selectedPriceIds.length}
                overlap={"circular"}
                sx={{
                    position: "fixed",
                    bottom: "calc(24px + env(safe-area-inset-bottom))",
                    right: 24,
                    "& .MuiBadge-badge": {
                        top: 6,
                        right: 6,
                        minWidth: 24,
                        height: 24,
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 600,
                        backgroundColor: "#F9F9F9",
                        color: "#121212",
                        border: "2px solid #121212",
                        zIndex: theme.zIndex.fab + 1
                    }
                }}
            >
                <Fab
                    aria-label={`Checkout, ${selectedPriceIds.length.toString()} in cart`}
                    onClick={handleCartClick}
                    sx={{
                        backgroundColor: "#52535F",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
                        ":hover": { backgroundColor: "#5F6272" }
                    }}
                >
                    <IcecreamOutlinedIcon />
                </Fab>
            </Badge>
        </Zoom>
    );
}
