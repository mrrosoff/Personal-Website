import {getEnvironmentVariable} from '../emulator-state/EnvironmentVariables';

const FALLBACK_USERNAME = 'dev';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { output: getEnvironmentVariable(state.getEnvVariables(), 'user') || FALLBACK_USERNAME };
};

export default {optDef, functionDef};
