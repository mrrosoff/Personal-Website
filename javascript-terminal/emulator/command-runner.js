import {emulatorErrorType, makeError} from './emulator-error';
import * as CommandMappingUtil from '../emulator-state/CommandMapping';

export const run = (commandMapping, commandName, commandArgs, errorString = emulatorErrorType.COMMAND_NOT_FOUND) =>
{
  const notFoundCallback = () => ({output: makeError(errorString)})

  if(!CommandMappingUtil.isCommandSet(commandMapping, commandName))
  {
    return notFoundCallback(...commandArgs);
  }

  const command = CommandMappingUtil.getCommandFn(commandMapping, commandName);

  try
  {
    return command(...commandArgs);
  }
  catch(fatalCommandError)
  {
    return { output: emulatorErrorType.UNEXPECTED_COMMAND_FAILURE };
  }
};

export default {run};
