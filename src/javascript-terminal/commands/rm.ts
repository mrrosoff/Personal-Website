import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
	"--no-preserve-root, --noPreserveRoot": "",
	"-r, --recursive": "",
	"-f, --force": ""
};

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	if (argv.length === 0) {
		return {};
	}

	try {
		const deletionPath = relativeToAbsolutePath(state, argv[0]);
		const fs = state.getFileSystem();

		if (deletionPath === "/" && options.noPreserveRoot !== true) {
			return {};
		}

		options.recursive === true
			? DirOp.remove(fs, deletionPath)
			: FileOp.remove(fs, deletionPath);
		return { output: "" };
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
