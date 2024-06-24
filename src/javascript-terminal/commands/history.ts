import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: { getHistory: () => any[] }, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        return { output: state.getHistory().join("\n") };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
