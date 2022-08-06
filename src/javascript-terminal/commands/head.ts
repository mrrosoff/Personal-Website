import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = { "-n, --lines": "<count>" };

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	if (argv.length === 0) {
		return {};
	}

	try {
		const filePath = relativeToAbsolutePath(state, argv[0]);
		const file = FileOp.read(state.getFileSystem(), filePath);
		const lineCount = options.lines ? options.lines : 10;

		return { output: file.split("\n").slice(0, lineCount).join("\n") };
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
