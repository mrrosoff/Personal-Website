import commands from '../commands';

export const create = (commandMapping = commands) =>
{
  for(const commandName of Object.keys(commandMapping))
  {
    const command = commandMapping[commandName];

    if(!command.functionDef)
    {
      throw new Error(`Failed to create command mapping: missing command function for ${commandName}`);
    }

    if(!command.optDef)
    {
      throw new Error(`Failed to create command mapping: missing option definition (optDef) for ${commandName}`);
    }
  }

  return commandMapping;
};

export const isCommandSet = (commandMapping, commandName) =>
{
  return commandName in commandMapping;
};

export const setCommand = (commandMapping, commandName, commandFn, optDef) =>
{
  if(commandFn === undefined)
  {
    throw new Error(`Cannot set ${commandName} command without function`);
  }

  if(optDef === undefined)
  {
    throw new Error(`Cannot set ${commandName} command without optDef (pass in {} if the command takes no options)`);
  }

  commandMapping[commandName] = { 'functionDef': commandFn, 'optDef': optDef };
  return commandMapping;
};

export const getCommandFn = (commandMapping, commandName) =>
{
  if(commandName in commandMapping)
  {
    return commandMapping[commandName].functionDef;
  }

  return undefined;
};

export const getCommandOptDef = (commandMapping, commandName) =>
{
  if(commandName in commandMapping)
  {
    return commandMapping[commandName].optDef;
  }

  return undefined;
};

export const getCommandNames = (commandMapping) =>
{
  return Object.keys(commandMapping);
};

export default {create, isCommandSet, setCommand, getCommandFn, getCommandOptDef, getCommandNames};
