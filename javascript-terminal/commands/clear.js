import {create as createOutputs} from '../emulator-state/outputs';


export const optDef = {};

const clear = (state, commandOptions) =>
{
  return { state: state.setOutputs(createOutputs()) };
};

export default clear;
