import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';

const fileToTextOutput = (fs, filePath) =>
{
  const {err, file} = FileOp.readFile(fs, filePath);

  if(err) return err;

  return file.content;
};

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePaths = argv.map(pathArg => relativeToAbsolutePath(state, pathArg));
  return { output: filePaths.map(path => fileToTextOutput(state.getFileSystem(), path)).join("\n") };
};

export default {optDef, functionDef};
