import {parseOptions} from '../parser';
import * as DirOp from '../fs/operations-with-permissions/directory-operations';
import * as FileUtil from '../fs/util/file-util';
import {relativeToAbsolutePath} from '../emulator-state/util';

const EMPTY_DIR = FileUtil.makeDirectory();

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const newFolderPath = relativeToAbsolutePath(state, argv[0]);
  const {fs, err} = DirOp.addDirectory(state.getFileSystem(), newFolderPath, EMPTY_DIR, false);

  if(err)
  {
    return { output: err };
  }

  return { state: state.setFileSystem(fs) };
};

export default {optDef, functionDef};
