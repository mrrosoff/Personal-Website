import {parseOptions} from '../parser';
import * as OutputFactory from '../output';
import {create as createHistory} from '../emulator-state/history';

const clearStateHistory = (state) => state.setHistory(createHistory());

const stringifyStateHistory = (state) => state.getHistory().join('\n');

export const optDef = { '-c, --clear': '' };

const history = (state, commandOptions) =>
{
  const {options} = parseOptions(commandOptions, optDef);

  if(options.clear) return { state: clearStateHistory(state) };

  return { output: OutputFactory.makeTextOutput(stringifyStateHistory(state)) };
};

export default history;
