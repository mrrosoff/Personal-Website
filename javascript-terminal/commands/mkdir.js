import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';
import {makeEmptyDirectory} from "../fs/util/file-util";

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const newFolderPath = relativeToAbsolutePath(state, argv[0]);
  const {fs, err} = DirOp.addDirectory(state.getFileSystem(), newFolderPath, makeEmptyDirectory(), false);

  if(err)
  {
    return { output: err };
  }

  return { state: state.setFileSystem(fs) };
};

export default {optDef, functionDef};
