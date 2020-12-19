
export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { state: state.setOutputs([]) };
};

export default {optDef, functionDef};
