import * as EnvVariableUtil from './environment-variables';
import * as PathUtil from '../fs/util/path-util';


export const relativeToAbsolutePath = (state, path) =>
{
  return PathUtil.toAbsolutePath(path, EnvVariableUtil.getEnvironmentVariable(state.getEnvVariables(), 'cwd'));
};
