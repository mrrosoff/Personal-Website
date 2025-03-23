import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: any, commandOptions: string[]) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	if (argv.length === 0) {
		return {};
	}

	try {
		const filePaths = argv.map((pathArg) => relativeToAbsolutePath(state, pathArg));
		return {
			output: filePaths.map((path) => FileOp.read(state.getFileSystem(), path)).join("\n")
		};
	} catch (err: any) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
