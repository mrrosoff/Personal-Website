import {parseOptions} from '../parser';
import * as OutputFactory from '../output';
import {relativeToAbsolutePath} from '../emulator-state/util';

export const optDef = { '-n, --lines': '<count>' };

const tail = (state, commandOptions) =>
{
  const {argv, options} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePath = relativeToAbsolutePath(state, argv[0]);
  const tailTrimmingFn = (lines, lineCount) => lines.slice(-1 * lineCount);
  const {content, err} = trimFileContent(state.getFileSystem(), filePath, options, tailTrimmingFn);

  if(err) return { output: OutputFactory.makeErrorOutput(err) };

  return { output: OutputFactory.makeTextOutput(content) };
};

export default tail;
