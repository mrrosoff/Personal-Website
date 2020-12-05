import {parseOptions} from '../parser';
import * as FileOp from '../fs/operations-with-permissions/file-operations';
import * as OutputFactory from '../output';
import * as FileUtil from '../fs/util/file-util';
import {relativeToAbsolutePath} from '../emulator-state/util';

const EMPTY_FILE = FileUtil.makeFile();

export const optDef = {};

const touch = (state, commandOptions) =>
{
  const {argv} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePath = relativeToAbsolutePath(state, argv[0]);

  if(state.getFileSystem().has(filePath)) return {};

  const {fs, err} = FileOp.writeFile(state.getFileSystem(), filePath, EMPTY_FILE);

  if(err) return { output: OutputFactory.makeErrorOutput(err) };

  return { state: state.setFileSystem(fs) };
};

export default touch;
