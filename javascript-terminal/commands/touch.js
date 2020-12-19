import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';
import {makeEmptyFile} from "../fs/util/file-util";

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePath = relativeToAbsolutePath(state, argv[0]);

  if(state.getFileSystem().has(filePath)) return {};

  const {fs, err} = FileOp.writeFile(state.getFileSystem(), filePath, makeEmptyFile());

  if(err) return { output: err };

  return { state: state.setFileSystem(fs) };
};

export default {optDef, functionDef};
