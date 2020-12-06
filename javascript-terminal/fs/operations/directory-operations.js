import * as FileUtil from '../util/file-util';
import * as GlobUtil from '../util/glob-util';
import * as PathUtil from '../util/path-util';
import * as BaseOp from './base-operations';
import {fsErrorType, makeError} from '../fs-error';
import {hasFile} from './file-operations';

const onlyFilesFilter = fs => path => FileUtil.isFile(fs[path]);
const onlyDirectoriesFilter = fs => path => FileUtil.isDirectory(fs[path]);

export const fillGaps = (fs) =>
{
  const emptyDirectory = FileUtil.makeDirectory();

  const directoryGapPaths = Object.keys(fs).flatMap(path => PathUtil.getPathBreadCrumbs(path)).filter(path => !fs[path]);

  for(const directoryGapPath of directoryGapPaths)
  {
    fs[directoryGapPath] = emptyDirectory;
  }

  return fs
};

export const hasDirectory = (fs, path) =>
{
  return fs[path] && FileUtil.isDirectory(fs[path]);
};

export const listDirectoryFiles = (fs, path) =>
{
  if(hasFile(fs, path))
  {
    return { err: makeError(fsErrorType.FILE_EXISTS, 'File exists at path') };
  }

  if(!hasDirectory(fs, path))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, 'Cannot list files in non-existent directory') };
  }

  const filesPattern = path === '/' ? '/*' : `${path}/*`;

  return { list: GlobUtil.captureGlobPaths(fs, filesPattern, onlyFilesFilter(fs)) };
};

export const listDirectoryFolders = (fs, path, isTrailingSlashAppended = true) =>
{
  if(hasFile(fs, path))
  {
    return { err: makeError(fsErrorType.FILE_EXISTS, 'File exists at path') };
  }

  if(!hasDirectory(fs, path))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, 'Cannot list folders in non-existent directory') };
  }

  const foldersPattern = path === '/' ? '/*' : `${path}/*`;
  const folderNames = GlobUtil.captureGlobPaths(fs, foldersPattern, onlyDirectoriesFilter(fs));

  if(isTrailingSlashAppended)
  {
    return { list: folderNames.map(folderName => `${folderName}/`) };
  }

  return { list: folderNames };
};

export const listDirectory = (fs, path, addTrailingSlash = true) =>
{
  const {err: listFileErr, list: fileList} = listDirectoryFiles(fs, path);
  const {err: listFolderErr, list: folderList} = listDirectoryFolders(fs, path, addTrailingSlash);

  if(listFileErr || listFolderErr)
  {
    return {err: listFileErr ? listFileErr : listFolderErr};
  }

  return {list: fileList.concat(folderList)};
};

export const addDirectory = (fs, path, dir, addParentPaths = true) =>
{
  if(hasFile(fs, PathUtil.getPathParent(path)))
  {
    return { err: makeError(fsErrorType.FILE_EXISTS, 'File exists at path') };
  }

  return BaseOp.add(fs, path, dir, addParentPaths);
};

const isPathTypeMatching = (fs, pathSeq) =>
{
  for(const [srcPath, destPath] of pathSeq)
  {
    if(fs[destPath])
    {
      if(hasFile(fs, srcPath) && hasDirectory(fs, destPath))
      {
        return false;
      }

      else if(hasDirectory(fs, srcPath) && hasFile(fs, destPath))
      {
        return false;
      }
    }
  }

  return true;
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
