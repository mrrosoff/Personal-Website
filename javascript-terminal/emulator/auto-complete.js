import * as PathUtil from '../fs/util/path-util';
import {getCommandNames, getCommandOptDef, isCommandSet} from '../emulator-state/CommandMapping';
import {isDirectory} from "../fs/util/file-util";

export const suggestCommands = (cmdMapping, partialStr) =>
{
  const commandNameSeq = getCommandNames(cmdMapping);
  return commandNameSeq.filter((cmd) => partialStr === cmd.substr(0, partialStr.length))
};

export const suggestCommandOptions = (cmdMapping, commandName, partialStr) =>
{
  if(!isCommandSet(cmdMapping, commandName))
  {
    return [];
  }

  const optDefSeq = Object.keys(getCommandOptDef(cmdMapping, commandName)).flatMap(opts => opts.split(',').map(opt => opt.trim()));
  return optDefSeq.filter((option) => partialStr === option.substr(0, partialStr.length))
};

export const suggestFileSystemNames = (fileSystem, cwd, partialStr) =>
{
  const path = PathUtil.toAbsolutePath(partialStr, cwd);

  const completeNamePattern = `${path}*`;
  const completeSubfolderPattern = path === '/' ? '/*' : `${path}*/*`;
  const globPattern = partialStr.endsWith('/') ? completeSubfolderPattern : completeNamePattern;

  const childPaths = GlobUtil.globPaths(fileSystem, globPattern);

  if(PathUtil.isAbsolutePath(partialStr))
  {
    return [...childPaths];
  }

  return [...childPaths.map(path =>
  {
    let pathPartsWithoutTail = PathUtil.toPathParts(partialStr);

    if (isDirectory(fileSystem[path]))
    {
      pathPartsWithoutTail = pathPartsWithoutTail.slice(0, -1);
    }

    return PathUtil.toPath(pathPartsWithoutTail.concat(PathUtil.getLastPathPart(path)));
  })];
};
