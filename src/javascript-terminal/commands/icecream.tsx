import { Navigate } from "react-router-dom";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        return {
            output: <Navigate to="/ice-cream" replace={true} />,
            type: "react"
        };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
