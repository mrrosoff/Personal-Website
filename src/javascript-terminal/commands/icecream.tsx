import { Navigate } from "react-router-dom";

export const optDef = {};

const functionDef = (state: { getEnvVariables: () => any }, commandOptions: string[]) => {
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
