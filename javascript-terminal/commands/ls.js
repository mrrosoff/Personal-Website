import {parseOptions} from '../parser';
import * as DirectoryOp from '../fs/operations-with-permissions/directory-operations';
import * as EnvVariableUtil from '../emulator-state/EnvironmentVariables';
import * as PathUtil from '../fs/util/path-util';

const IMPLIED_DIRECTORY_ENTRIES = ['.', '..'];

const resolveDirectoryToList = (envVariables, argv) =>
{
  const cwd = EnvVariableUtil.getEnvironmentVariable(envVariables, 'cwd');

  if(argv.length > 0) return PathUtil.toAbsolutePath(argv[0], cwd);

  return cwd;
};

const makeSortedReturn = (listing) =>
{
  return { output: listing.sort().join('\n') };
};

const removeHiddenFilesFilter = (record) =>
{
  return !record.startsWith('.');
};

export const optDef = {'-a, --all': '', '-A, --almost-all': '' };

const functionDef = (state, commandOptions) =>
{
  const {options, argv} = parseOptions(commandOptions, optDef);
  const dirPath = resolveDirectoryToList(state.getEnvVariables(), argv);
  const {err, list: dirList} = DirectoryOp.listDirectory(state.getFileSystem(), dirPath);

  if(err) return { output: err };

  if(options.all)
  {
    return makeSortedReturn(IMPLIED_DIRECTORY_ENTRIES.concat(dirList));
  }

  else if(options.almostAll)
  {
    return makeSortedReturn(dirList);
  }

  return makeSortedReturn(dirList.filter(removeHiddenFilesFilter));
};

export default {optDef, functionDef};
