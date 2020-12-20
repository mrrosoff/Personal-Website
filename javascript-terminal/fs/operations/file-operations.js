import * as BaseOp from './base-operations';
import {fsSearch, fsSearchParent} from "./base-operations";
import {getLastPathPart} from "../util/path-util";

export const read = (fs, path) =>
{
  return fsSearch(fs, path);
};

export const write = (fs, path, file) =>
{
  BaseOp.add(fs, path, file);
};

export const copy = (fs, srcPath, destPath) =>
{
  const fsPart = fsSearchParent(fs, srcPath);

  if (fsPart[getLastPathPart(srcPath)].type !== "-")
  {
    throw Error("Not A File At Specified Path")
  }

  fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs, path) =>
{
  const fsPart = fsSearchParent(fs, path);

  if (fsPart[getLastPathPart(path)].type !== "-")
  {
    throw Error("Not A File At Specified Path")
  }

  return BaseOp.remove(fs, path);
};

export const rename = (fs, currentPath, newPath) =>
{
  copy(fs, currentPath, newPath);
  remove(fs, currentPath);
};
