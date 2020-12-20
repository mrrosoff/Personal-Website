import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';
import {fsSearch} from "../fs/operations/base-operations";

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
	const {options, argv} = parseOptions(commandOptions, optDef);

	try
	{
		const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : '/';

		fsSearch(state.getFileSystem(), newCwdPath);

		state.setEnvVariables({...state.getEnvVariables(), cwd: newCwdPath});
		return {output: "", type: "cwd"};
	}

	catch(err)
	{
		return {output: err.message, type: "error"};
	}
};

export default {optDef, functionDef};
