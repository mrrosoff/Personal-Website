import * as FileUtil from '../util/file-util';
import * as PathUtil from '../util/path-util';
import * as BaseOp from './base-operations';
import {isFile} from "../util/file-util";
import {findFsPart} from "./base-operations";
import {getLastPathPart} from "../util/path-util";

export const listDirectory = (fs, path) =>
{
  return Object.keys(findFsPart(fs, path));
};

export const addDirectory = (fs, path, dir) =>
{
  return BaseOp.add(fs, path, dir);
};

export const copyDirectory = (fs, srcPath, destPath, overwrite = true) =>
{
  if(!hasDirectory(fs, srcPath))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, 'Source directory does not exist') };
  }

  if(!hasDirectory(fs, destPath))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, 'Destination directory does not exist') };
  }

  const srcChildPattern = srcPath === '/' ? '/**' : `${srcPath}/**`;
  const srcPaths = GlobUtil.globPaths(fs, srcChildPattern);
  const srcSubPaths = GlobUtil.captureGlobPaths(fs, srcChildPattern);
  const destPaths = srcSubPaths.map(path => path === '/' ? destPath : `${destPath}/${path}`);

  if(!isPathTypeMatching(fs, srcPaths.zip(destPaths)))
  {
    return { err: makeError(fsErrorType.OTHER, 'Cannot overwrite a directory with file OR a file with directory') };
  }

  for(const [srcPath, destPath] of srcPaths.zip(destPaths))
  {
    if(!fs.has(destPath) || overwrite)
    {
      fs[destPath] = fs[srcPath];
    }
  }

  return { fs: fs };
};

export const deleteDirectory = (fs, pathToDelete, isNonEmptyDirectoryRemovable = false) =>
{
  if(hasFile(fs, pathToDelete))
  {
    return { err: makeError(fsErrorType.FILE_EXISTS, 'File exists at path') };
  }

  if(!hasDirectory(fs, pathToDelete))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, `No such directory: ${pathToDelete}`) };
  }

  return BaseOp.remove(fs, pathToDelete, isNonEmptyDirectoryRemovable);
};

export const renameDirectory = (fs, currentPath, newPath) =>
{
  const {err, fs: copiedFS} = copyDirectory(fs, currentPath, newPath, true);

  if(err)
  {
    return {err};
  }

  return deleteDirectory(copiedFS, currentPath, true);
};
