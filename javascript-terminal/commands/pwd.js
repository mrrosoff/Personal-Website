export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { output: state.getEnvVariables().cwd };
};

export default {optDef, functionDef};
