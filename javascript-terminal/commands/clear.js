import {create as createOutputs} from '../emulator-state/Outputs';


export const optDef = {};

const functionDef = (state, commandOptions) =>
{
  return { state: state.setOutputs(createOutputs()) };
};

export default {optDef, functionDef};
