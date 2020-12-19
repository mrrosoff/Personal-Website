import {parseOptions} from '../parser';
import {relativeToAbsolutePath} from '../emulator-state/EmulatorState';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);
  const oldCwdPath = state.getEnvVariables().cwd;
  const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : '/';

  if(!DirectoryOp.hasDirectory(state.getFileSystem(), newCwdPath))
  {
    return { output: makeError(fsErrorType.NO_SUCH_DIRECTORY) };
  }

  return { state: state.setEnvVariables({...state.getEnvVariables(), cwd: newCwdPath }), output: oldCwdPath, type: "cwd" };
};

export default {optDef, functionDef};
