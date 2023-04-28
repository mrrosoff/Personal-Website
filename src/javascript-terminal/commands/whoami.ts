import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: any, commandOptions: any) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        return { output: state.getEnvVariables().user ? state.getEnvVariables().user : "dev" };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
