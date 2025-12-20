import assert from "assert";

import { Navigate } from "react-router-dom";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (_state: EmulatorState, _commandOptions: string[]) => {
    try {
        return {
            output: <Navigate to="/ice-cream" replace={true} />,
            type: "react"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     icecream -- navigate to ice cream shop

SYNOPSIS
     icecream

DESCRIPTION
     Navigates to the ice cream shop page where you can browse and purchase
     ice cream flavors.`;

export default { optDef, functionDef };
