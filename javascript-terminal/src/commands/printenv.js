import {parseOptions} from '../parser';
import * as OutputFactory from '../output';
import {getEnvironmentVariable} from '../emulator-state/environment-variables';

const stringifyEnvVariables = (envVariables) =>
{
  const outputs = envVariables.reduce((outputs, varVal, varKey) => [...outputs, `${varKey}=${varVal}`], []);
  return outputs.join('\n');
};

export const optDef = {};

const printenv = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);
  const envVariables = state.getEnvVariables();

  if(argv.length === 0) return { output: OutputFactory.makeTextOutput(stringifyEnvVariables(envVariables)) };

  const varValue = getEnvironmentVariable(envVariables, argv[0]);

  if(varValue) return { output: OutputFactory.makeTextOutput(varValue) };

  return {};
};

export default printenv;
