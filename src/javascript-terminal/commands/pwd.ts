import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (
    state: { getEnvVariables: () => { (): any; new (): any; cwd: any } },
    commandOptions: string[]
) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        return { output: state.getEnvVariables().cwd };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
