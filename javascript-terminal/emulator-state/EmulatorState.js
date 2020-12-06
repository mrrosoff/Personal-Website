import {create as createCommandMapping} from './CommandMapping';
import {create as createEnvironmentVariables} from './EnvironmentVariables';
import {create as createFileSystem} from './FileSystem';
import {create as createHistory} from './History';
import {create as createOutputs} from './Outputs';

const FS_KEY = 'fs';
const ENVIRONMENT_VARIABLES_KEY = 'environmentVariables';
const HISTORY_KEY = 'history';
const OUTPUTS_KEY = 'outputs';
const COMMAND_MAPPING_KEY = 'commandMapping';

export default class EmulatorState
{
  constructor(state)
  {
    if(!state)
    {
      throw new Error('Do not use the constructor directly. Use the static create method.');
    }

    this.state = state;
  }

  static createEmpty()
  {
    return EmulatorState.create({});
  }

  static create({
                  fs = createFileSystem(),
                  environmentVariables = createEnvironmentVariables(),
                  history = createHistory(),
                  outputs = createOutputs(),
                  commandMapping = createCommandMapping()
                })
  {
    const stateMap = {
      [FS_KEY]: fs,
      [ENVIRONMENT_VARIABLES_KEY]: environmentVariables,
      [HISTORY_KEY]: history,
      [OUTPUTS_KEY]: outputs,
      [COMMAND_MAPPING_KEY]: commandMapping
    };

    return new EmulatorState(stateMap);
  }

  getFileSystem()
  {
    return this.state[FS_KEY];
  }

  setFileSystem(newFileSystem)
  {
    this.state[FS_KEY] = newFileSystem;
    return this;
  }

  getEnvVariables()
  {
    return this.state[ENVIRONMENT_VARIABLES_KEY];
  }

  setEnvVariables(newEnvVariables)
  {
    this.state[ENVIRONMENT_VARIABLES_KEY] = newEnvVariables;
  }

  getHistory()
  {
    return this.state[HISTORY_KEY];
  }

  setHistory(newHistory)
  {
    this.state[HISTORY_KEY] = newHistory;
  }

  getOutputs()
  {
    return this.state[OUTPUTS_KEY];
  }

  setOutputs(newOutputs)
  {
    this.state[OUTPUTS_KEY] = newOutputs;
  }

  getCommandMapping()
  {
    return this.state[COMMAND_MAPPING_KEY];
  }

  setCommandMapping(newCommandMapping)
  {
    this.state[COMMAND_MAPPING_KEY] = newCommandMapping;
  }

  getState()
  {
    return this.state;
  }
}
