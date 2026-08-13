import assert from "assert";

import { Navigate } from "react-router-dom";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (_state: EmulatorState, _commandOptions: string[]) => {
    try {
        return {
            output: <Navigate to="/polaroid" replace={true} />,
            type: "react"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     polaroid -- navigate to polaroid

SYNOPSIS
     polaroid

DESCRIPTION
     Navigates to the polaroid page where you can upload images
     if you have a compatible device.`;

export default { optDef, functionDef };
