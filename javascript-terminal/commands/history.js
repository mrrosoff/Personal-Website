import {parseOptions} from '../parser';
import {create as createHistory} from '../emulator-state/History';

const clearStateHistory = (state) => state.setHistory(createHistory());

const stringifyStateHistory = (state) => state.getHistory().join('\n');

export const optDef = { '-c, --clear': '' };

const functionDef = (state, commandOptions) =>
{
  const {options} = parseOptions(commandOptions, optDef);

  if(options.clear) return { state: clearStateHistory(state) };

  return { output: stringifyStateHistory(state) };
};

export default {optDef, functionDef};
