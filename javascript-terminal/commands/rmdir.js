import {parseOptions} from '../parser';
import * as DirOp from '../fs/operations-with-permissions/directory-operations';
import {relativeToAbsolutePath} from '../emulator-state/util';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const pathToDelete = relativeToAbsolutePath(state, argv[0]);
  const {fs, err} = DirOp.deleteDirectory(state.getFileSystem(), pathToDelete, false);

  if(err)
  {
    return { output: err };
  }

  return { state: state.setFileSystem(fs) };
};

export default {optDef, functionDef};
