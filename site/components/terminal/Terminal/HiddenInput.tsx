import { forwardRef } from "react";
import type { InputHTMLAttributes, Ref } from "react";

const HiddenInput = (
    props: InputHTMLAttributes<HTMLInputElement>,
    ref: Ref<HTMLInputElement | null>
) => (
    <input
        ref={ref}
        type="text"
        value=""
        style={{ width: 0, height: 0, opacity: 0, position: "absolute", top: 0, left: 0 }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        {...props}
    />
);

export default forwardRef(HiddenInput);
