import {getEnvironmentVariable} from '../emulator-state/EnvironmentVariables';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { output: getEnvironmentVariable(state.getEnvVariables(), 'cwd') };
};

export default {optDef, functionDef};
