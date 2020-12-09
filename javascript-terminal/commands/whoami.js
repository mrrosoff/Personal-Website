const FALLBACK_USERNAME = 'dev';

export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { output:  state.getEnvVariables().user ? state.getEnvVariables().user : FALLBACK_USERNAME };
};

export default {optDef, functionDef};
