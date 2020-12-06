import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import * as FileUtil from '../fs/util/file-util';
import {relativeToAbsolutePath} from '../emulator-state/util';

const EMPTY_FILE = FileUtil.makeFile();

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePath = relativeToAbsolutePath(state, argv[0]);

  if(state.getFileSystem().has(filePath)) return {};

  const {fs, err} = FileOp.writeFile(state.getFileSystem(), filePath, EMPTY_FILE);

  if(err) return { output: err };

  return { state: state.setFileSystem(fs) };
};

export default {optDef, functionDef};
