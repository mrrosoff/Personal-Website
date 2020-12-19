import * as PathUtil from './path-util';

const DEFAULT_PERMISSION = true;

const isModificationAllowed = (fs, path) =>
{
  const directory = fs.get(path, null);

  if(directory)
  {
    const canModify = directory.get('canModify', DEFAULT_PERMISSION);

    if(!canModify)
    {
      return false;
    }
  }

  return true;
};

export const canModifyPath = (fs, path) =>
{
  const breadCrumbPaths = PathUtil.getPathBreadCrumbs(path);

  for(const breadCrumbPath of breadCrumbPaths)
  {
    if(!isModificationAllowed(fs, breadCrumbPath))
    {
      return false;
    }
  }

  return true;
};
