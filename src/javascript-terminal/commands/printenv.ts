import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);
	const envVariables = state.getEnvVariables();

	if (argv.length === 0) {
		return {
			output: Object.entries(envVariables)
				.map((entry) => entry[0] + "=" + entry[1])
				.join("\n")
		};
	}

	try {
		const varValue = envVariables[argv[0]];

		if (varValue) {
			return { output: varValue };
		}

		return {};
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
