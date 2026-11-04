import { useEffect, useId, useState } from "react";

import { Box, TextField, type TextFieldProps, Typography } from "@mui/material";
import { validate } from "email-validator";

export const emailProblem = (email: string) => (validate(email) ? null : "Enter a valid email.");

const FormField = ({
    label,
    problem,
    error,
    helperText,
    sx,
    ...props
}: TextFieldProps & { label: string; problem?: (value: string) => string | null }) => {
    const id = useId();
    const value = String(props.value ?? "");
    const [settledValue, setSettledValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setSettledValue(value), 600);
        return () => clearTimeout(timeout);
    }, [value]);

    const settledProblem = value && value === settledValue ? problem?.(value) : null;
    return (
        <Box sx={sx}>
            <Typography
                component={"label"}
                htmlFor={id}
                sx={{ display: "block", fontSize: 18, lineHeight: 1.2, opacity: 0.7, mb: 0.75 }}
            >
                {label}
            </Typography>
            <TextField
                {...props}
                id={id}
                error={error || !!settledProblem}
                helperText={helperText || settledProblem}
                fullWidth
                sx={{
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "#1C1C1E",
                        borderRadius: "4px",
                        fontSize: 22,
                        color: "#F9F9F9",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                        "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#F9F9F9", borderWidth: 1 }
                    },
                    "& .MuiOutlinedInput-input": { padding: "9px 12px" },
                    "& .MuiOutlinedInput-input::placeholder": {
                        color: "rgba(255,255,255,0.4)",
                        opacity: 1
                    },
                    "& .MuiFormHelperText-root": { fontSize: 18, mx: 0 }
                }}
            />
        </Box>
    );
};

export default FormField;
