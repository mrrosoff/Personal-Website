import * as FileUtil from '../fs/util/file-util';
import * as DirOp from '../fs/operations/directory-operations';

const DEFAULT_FILE_SYSTEM = { '/': FileUtil.makeDirectory() };

export const create = (fs = DEFAULT_FILE_SYSTEM) =>
{
  return DirOp.fillGaps(fs);
};

export default {create};
