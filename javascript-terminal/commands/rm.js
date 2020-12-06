import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import * as DirOp from '../fs/operations-with-permissions/directory-operations';
import {relativeToAbsolutePath} from '../emulator-state/util';
import {fsErrorType, makeError} from '../fs/fs-error';

export const optDef = {
  '--no-preserve-root, --noPreserveRoot': '',
  '-r, --recursive': ''
};

const makeNoPathErrorOutput = () =>
{
  const noSuchFileOrDirError = makeError(fsErrorType.NO_SUCH_FILE_OR_DIRECTORY);

  return { output: noSuchFileOrDirError };
};

const functionDef = (state, commandOptions) =>
{
  const {argv, options} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const deletionPath = relativeToAbsolutePath(state, argv[0]);
  const fs = state.getFileSystem();

  if(deletionPath === '/' && options.noPreserveRoot !== true) return {};

  if(!fs.has(deletionPath)) return makeNoPathErrorOutput();

  const {fs: deletedPathFS, err} = options.recursive === true ?
      DirOp.deleteDirectory(fs, deletionPath, true) :
      FileOp.deleteFile(fs, deletionPath);

  if(err) return { output: err };

  return { state: state.setFileSystem(deletedPathFS) };
};

export default {optDef, functionDef};
