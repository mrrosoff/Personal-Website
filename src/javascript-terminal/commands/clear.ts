import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: any, commandOptions: any) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        state.setOutputs([]);
        return {};
    } catch (err: unknown) {
        return { output: (err as any).message, type: "error" };
    }
};

export default { optDef, functionDef };
