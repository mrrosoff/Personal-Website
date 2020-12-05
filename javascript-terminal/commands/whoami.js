import * as OutputFactory from '../output';
import {getEnvironmentVariable} from '../emulator-state/environment-variables';

const FALLBACK_USERNAME = 'dev';

export const optDef = {};

const whoami = (state, commandOptions) =>
{
  return { output: OutputFactory.makeTextOutput(getEnvironmentVariable(state.getEnvVariables(), 'user') || FALLBACK_USERNAME) };
};

export default whoami;
