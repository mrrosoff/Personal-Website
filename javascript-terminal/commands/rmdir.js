import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
	const {options, argv} = parseOptions(commandOptions, optDef);

	if(argv.length === 0)
	{
		return {};
	}

	try
	{
		const pathToDelete = relativeToAbsolutePath(state, argv[0]);
		const {fs, err} = DirOp.deleteDirectory(state.getFileSystem(), pathToDelete, false);
		state.setFileSystem(fs);
		return {output: ""};
	}

	catch(err)
	{
		return {output: err.message, type: "error"};
	}
};

export default {optDef, functionDef};
