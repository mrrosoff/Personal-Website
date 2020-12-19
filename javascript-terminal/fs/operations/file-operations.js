import * as PathUtil from '../util/path-util';
import * as BaseOp from './base-operations';
import {isFile} from '../util/file-util';
import {hasDirectory} from './directory-operations';

export const readFile = (fs, filePath) =>
{
  if(isFile(filePath))
  {
    return fs[filePath].content;
  }

  return null;
};

export const writeFile = (fs, filePath, file) =>
{
  return BaseOp.add(fs, filePath, file);
};

export const copyFile = (fs, sourcePath, destPath) =>
{
  if(!hasFile(fs, sourcePath))
  {
    return { err: makeError(fsErrorType.NO_SUCH_FILE, 'Source file does not exist') };
  }

  const pathParent = PathUtil.getPathParent(destPath);

  if(!hasDirectory(fs, pathParent))
  {
    return { err: makeError(fsErrorType.NO_SUCH_DIRECTORY, 'Destination directory does not exist') };
  }

  if(hasDirectory(fs, destPath))
  {
    const sourceFileName = PathUtil.getLastPathPart(sourcePath);
    destPath = destPath === '/' ? `/${sourceFileName}` : `${destPath}/${sourceFileName}`;
  }

  fs[destPath] = fs[sourcePath];

  return { fs: fs };
};

export const deleteFile = (fs, filePath) =>
{
  if(hasDirectory(fs, filePath))
  {
    return { err: makeError(fsErrorType.IS_A_DIRECTORY) };
  }

  if(!hasFile(fs, filePath))
  {
    return { err: makeError(fsErrorType.NO_SUCH_FILE) };
  }

  return BaseOp.remove(fs, filePath);
};
