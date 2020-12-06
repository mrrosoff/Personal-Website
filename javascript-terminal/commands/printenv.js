import {parseOptions} from '../parser';
import {getEnvironmentVariable} from '../emulator-state/EnvironmentVariables';

const stringifyEnvVariables = (envVariables) =>
{
  const outputs = envVariables.reduce((outputs, varVal, varKey) => [...outputs, `${varKey}=${varVal}`], []);
  return outputs.join('\n');
};

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);
  const envVariables = state.getEnvVariables();

  if(argv.length === 0) return { output: stringifyEnvVariables(envVariables) };

  const varValue = getEnvironmentVariable(envVariables, argv[0]);

  if(varValue) return { output: varValue };

  return {};
};

export default {optDef, functionDef};
