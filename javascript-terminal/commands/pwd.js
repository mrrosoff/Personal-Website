import * as OutputFactory from '../output';
import {getEnvironmentVariable} from '../emulator-state/environment-variables';

export const optDef = {};

const pwd = (state, commandOptions) =>
{
  return { output: OutputFactory.makeTextOutput(getEnvironmentVariable(state.getEnvVariables(), 'cwd')) };
};

export default pwd;
