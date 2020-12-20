import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';

export const optDef = {'-n, --lines': '<count>'};

const functionDef = (state, commandOptions) =>
{
	const {options, argv} = parseOptions(commandOptions, optDef);

	if(argv.length === 0)
	{
		return {};
	}

	try
	{
		const filePath = relativeToAbsolutePath(state, argv[0]);
		const tailTrimmingFn = (lines, lineCount) => lines.slice(-1 * lineCount);
		return {output: trimFileContent(state.getFileSystem(), filePath, options, tailTrimmingFn)};
	}

	catch(err)
	{
		return {output: err.message, type: "error"};
	}
};

export default {optDef, functionDef};
