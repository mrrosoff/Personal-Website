import {parseOptions} from '../parser';
import * as DirectoryOp from '../fs/operations-with-permissions/directory-operations';
import * as EnvVariableUtil from '../emulator-state/environment-variables';
import * as OutputFactory from '../output';
import {fsErrorType, makeError} from '../fs/fs-error';
import {relativeToAbsolutePath} from '../emulator-state/util';

export const optDef = {};

const cd = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);
  const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : '/';

  if(!DirectoryOp.hasDirectory(state.getFileSystem(), newCwdPath))
  {
    const newCwdPathDoesNotExistErr = makeError(fsErrorType.NO_SUCH_DIRECTORY);

    return { output: OutputFactory.makeErrorOutput(newCwdPathDoesNotExistErr) };
  }

  return { state: state.setEnvVariables(EnvVariableUtil.setEnvironmentVariable(state.getEnvVariables(), 'cwd', newCwdPath)) };
};

export default cd;
