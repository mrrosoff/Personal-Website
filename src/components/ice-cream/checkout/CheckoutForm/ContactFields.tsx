import { Grid, Typography } from "@mui/material";

import FormField, { emailProblem } from "../../../FormField";
import { streetProblem, useCheckoutForm, zipProblem } from "./CheckoutFormContext";

const DeliveryAddressFields = () => {
    const { address, setAddress } = useCheckoutForm();
    return (
        <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            <Grid size={12}>
                <FormField
                    label={"Street Address"}
                    autoComplete={"address-line1"}
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    problem={streetProblem}
                    placeholder={"1 Ferry Building"}
                />
            </Grid>
            <Grid size={6}>
                <FormField
                    label={"Apt / Unit"}
                    autoComplete={"address-line2"}
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder={"Optional"}
                />
            </Grid>
            <Grid size={6}>
                <FormField
                    label={"ZIP"}
                    autoComplete={"postal-code"}
                    value={address.postalCode}
                    onChange={(e) =>
                        setAddress({
                            ...address,
                            postalCode: e.target.value.replace(/\D/g, "").slice(0, 5)
                        })
                    }
                    problem={zipProblem}
                    placeholder={"94111"}
                    slotProps={{ htmlInput: { inputMode: "numeric" } }}
                />
            </Grid>
        </Grid>
    );
};

const ContactFields = () => {
    const { email, setEmail, emailError } = useCheckoutForm();
    return (
        <>
            <Typography variant={"h2"} mb={2}>
                Contact Info
            </Typography>
            <FormField
                label={"Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                problem={emailProblem}
                placeholder={"karl@fog.sf"}
                error={!!emailError}
                helperText={emailError}
            />
            <DeliveryAddressFields />
        </>
    );
};

export default ContactFields;
