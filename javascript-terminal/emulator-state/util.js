import * as PathUtil from '../fs/util/path-util';


export const relativeToAbsolutePath = (state, path) =>
{
  return PathUtil.toAbsolutePath(path, state.getEnvVariables().cwd);
};
