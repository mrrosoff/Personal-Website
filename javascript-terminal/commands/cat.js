import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import {relativeToAbsolutePath} from '../emulator-state/util';

const fileToTextOutput = (fs, filePath) =>
{
  const {err, file} = FileOp.readFile(fs, filePath);

  if(err) return OutputFactory.makeErrorOutput(err);

  return file.content;
};

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePaths = argv.map(pathArg => relativeToAbsolutePath(state, pathArg));
  return { outputs: filePaths.map(path => fileToTextOutput(state.getFileSystem(), path)) };
};

export default {optDef, functionDef};
