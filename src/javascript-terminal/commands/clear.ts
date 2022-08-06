import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	try {
		state.setOutputs([]);
		return {};
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
