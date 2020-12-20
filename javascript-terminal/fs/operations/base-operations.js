import {getLastPathPart, toPathParts} from "../util/path-util";

export const findFsPartWithFailedPaths = (fs, path) =>
{
  let fsSection = fs;
  let pathParts = toPathParts(path);

  for (const pathPart of pathParts)
  {
    if(!fsSection[pathPart])
    {
      return fsSection;
    }

    fsSection = fsSection[pathPart].contents;
  }

  return fsSection;
}

export const findFsPart = (fs, path) =>
{
  let fsSection = fs;
  let pathParts = toPathParts(path);

  for (const pathPart of pathParts)
  {
    if(!fsSection[pathPart])
    {
      throw new Error("Specified Path Not In Filesystem");
    }

    fsSection = fsSection[pathPart].contents;
  }

  return fsSection;
}

export const add = (fs, pathToAdd, fsElementToAdd) =>
{
  findFsPartWithFailedPaths(fs, pathToAdd)[getLastPathPart(pathToAdd)] = fsElementToAdd;
};

export const remove = (fs, pathToRemove) =>
{
  delete findFsPart(fs, pathToRemove)[getLastPathPart(pathToRemove)];
};
