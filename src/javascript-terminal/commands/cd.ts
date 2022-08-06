import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { fsSearchParent } from "../fs/operations/base-operations";
import { getLastPathPart } from "../fs/util/path-util";

export const optDef = {};

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	try {
		const oldCwdPath = state.getEnvVariables().cwd;
		const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : "/";
		const parent = fsSearchParent(state.getFileSystem(), newCwdPath);

		if (!parent[getLastPathPart(newCwdPath)]) {
			throw Error("No Directory At Specified Location");
		}

		if (parent[getLastPathPart(newCwdPath)].type !== "d") {
			throw Error("File At Specified Location");
		}

		state.setEnvVariables({ ...state.getEnvVariables(), cwd: newCwdPath });
		return { output: "", type: "cwd", oldCwdPath: oldCwdPath };
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
