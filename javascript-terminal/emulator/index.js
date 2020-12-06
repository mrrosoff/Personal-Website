import CommandRunner from '../emulator/command-runner';
import {parseCommands} from '../parser';
import {getEnvironmentVariable} from '../emulator-state/EnvironmentVariables';
import {suggestCommandOptions, suggestCommands, suggestFileSystemNames} from './auto-complete';

export default class Emulator
{
  autocomplete(state, partialStr)
  {
    const suggestions = this.suggest(state, partialStr);

    if(suggestions.length !== 1)
    {
      return partialStr;
    }

    const strParts = partialStr.split(' ');

    strParts[strParts.length - 1] = suggestions[0]
    return strParts.join(' ');
  };

  suggest(state, partialStr)
  {
    partialStr = partialStr.replace(/^\s+/g, '');

    const lastPartialChar = partialStr.slice(-1);
    const isTypingNewPart = lastPartialChar === ' ';

    const strParts = partialStr.trim().split(' ');

    const cmdName = strParts[0];
    const lastTextEntered = strParts[strParts.length - 1];

    if(!isTypingNewPart && strParts.length === 1)
    {
      return suggestCommands(state.getCommandMapping(), cmdName);
    }

    const strToComplete = isTypingNewPart ? '' : lastTextEntered;
    const cwd = getEnvironmentVariable(state.getEnvVariables(), 'cwd');

    return [
      ...suggestCommandOptions(state.getCommandMapping(), cmdName, strToComplete),
      ...suggestFileSystemNames(state.getFileSystem(), cwd, strToComplete)
    ];
  };

  execute(state, str, executionListeners = [], errorString)
  {
    for(const executionListener of executionListeners)
    {
      executionListener.onExecuteStarted(state, str);
    }

    if(str.trim() === '')
    {
      state = this._addCommandOutputs(state, ['']);
    }

    else
    {
      state = this._addCommandToHistory(state, str);
      state = this._updateStateByExecution(state, str, errorString);
    }

    for(const executionListener of executionListeners)
    {
      executionListener.onExecuteCompleted(state);
    }

    return state;
  };

  _updateStateByExecution(state, commandStrToExecute, errorString)
  {
    for(const {commandName, commandOptions} of parseCommands(commandStrToExecute))
    {
      const commandMapping = state.getCommandMapping();
      const commandArgs = [state, commandOptions];

      const {state: nextState, output, outputs} = CommandRunner.run(commandMapping, commandName, commandArgs, errorString);

      if(nextState)
      {
        state = nextState;
      }

      if(output)
      {
        state = this._addCommandOutputs(state, [output]);
      }

      else if(outputs)
      {
        state = this._addCommandOutputs(state, outputs);
      }
    }

    return state;
  }

  _addCommandToHistory(state, command)
  {

    state.setHistory([...state.getHistory(), command]);
    return state;
  }

  _addCommandOutputs(state, outputs)
  {
    for(const output of outputs)
    {
      state.setOutputs([...state.getOutputs(), output]);
    }

    return state;
  }
}
