import {getLastPathPart, toPathParts} from "../util/path-util";

export const findFsPart = (fs, path) =>
{
  let fsSection = fs;
  let pathParts = toPathParts(path);

  for (const pathPart of pathParts.slice(0, pathParts.length - 1))
  {
    if(!fs[pathPart])
    {
      throw new Error("Specified Path Not In Filesystem");
    }

    fsSection = fs[pathPart];
  }

  return fsSection;
}

export const add = (fs, pathToAdd, fsElementToAdd) =>
{
  findFsPart(fs, pathToAdd)[getLastPathPart(pathToAdd)] = fsElementToAdd;
  return fs;
};

export const remove = (fs, pathToRemove) =>
{
  delete findFsPart(fs, pathToRemove)[getLastPathPart(pathToRemove)];
  return fs;
};
