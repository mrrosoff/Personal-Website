import {parseOptions} from '../parser';
import * as DirectoryOp from '../fs/operations-with-permissions/directory-operations';
import * as EnvVariableUtil from '../emulator-state/EnvironmentVariables';
import {fsErrorType, makeError} from '../fs/fs-error';
import {relativeToAbsolutePath} from '../emulator-state/util';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);
  const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : '/';

  if(!DirectoryOp.hasDirectory(state.getFileSystem(), newCwdPath))
  {
    return { output: makeError(fsErrorType.NO_SUCH_DIRECTORY) };
  }

  return { state: state.setEnvVariables(EnvVariableUtil.setEnvironmentVariable(state.getEnvVariables(), 'cwd', newCwdPath)) };
};

export default {optDef, functionDef};
