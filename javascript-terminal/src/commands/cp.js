import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import * as DirectoryOp from '../fs/operations-with-permissions/directory-operations';
import * as PathUtil from '../fs/util/path-util';
import * as OutputFactory from '../output';
import * as FileUtil from '../fs/util/file-util';
import {fsErrorType, makeError} from '../fs/fs-error';
import {relativeToAbsolutePath} from '../emulator-state/util';


const copySourceFile = (state, srcPath, destPath, isTrailingPathDest) =>
{
  const fs = state.getFileSystem();

  if(isTrailingPathDest && !DirectoryOp.hasDirectory(fs, destPath))
  {
    const dirAtTrailingPathNonExistentErr = makeError(fsErrorType.NO_SUCH_DIRECTORY);

    return { output: OutputFactory.makeErrorOutput(dirAtTrailingPathNonExistentErr) };
  }

  const {fs: copiedFS, err} = FileOp.copyFile(fs, srcPath, destPath);

  if(err) return { output: OutputFactory.makeErrorOutput(err) };

  return { state: state.setFileSystem(copiedFS) };
};

const copySourceDirectory = (state, srcPath, destPath) =>
{
  if(DirectoryOp.hasDirectory(state.getFileSystem(), destPath))
  {
    const lastPathComponent = PathUtil.getLastPathPart(srcPath);

    if(lastPathComponent !== '/')
    {
      destPath = `${destPath}/${lastPathComponent}`;
    }
  }

  if(!DirectoryOp.hasDirectory(state.getFileSystem(), destPath))
  {
    const emptyDir = FileUtil.makeDirectory();
    const {fs, err} = DirectoryOp.addDirectory(state.getFileSystem(), destPath, emptyDir, false);

    state = state.setFileSystem(fs);

    if(err)
    {
      return { output: OutputFactory.makeErrorOutput(err) };
    }
  }

  const {fs, err} = DirectoryOp.copyDirectory(state.getFileSystem(), srcPath, destPath);

  if(err) return { output: OutputFactory.makeErrorOutput(err) };

  return { state: state.setFileSystem(fs) };
};

export const optDef = { '-r, --recursive': '' };

const cp = (state, commandOptions) =>
{
  const {argv, options} = parseOptions(commandOptions, optDef);

  if(argv.length < 2) return {};

  const srcPath = relativeToAbsolutePath(state, argv[0]);
  const destPath = relativeToAbsolutePath(state, argv[1]);
  const isTrailingDestPath = PathUtil.isTrailingPath(argv[1]);

  if(srcPath === destPath)
  {
    return { output: OutputFactory.makeTextOutput('Source and destination are the same (not copied).') };
  }

  if(options.recursive) return copySourceDirectory(state, srcPath, destPath);

  return copySourceFile(state, srcPath, destPath, isTrailingDestPath);
};

export default cp;
