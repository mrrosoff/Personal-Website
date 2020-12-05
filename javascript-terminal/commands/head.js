import {parseOptions} from '../parser';
import * as OutputFactory from '../output';
import {relativeToAbsolutePath} from '../emulator-state/util';

export const optDef = { '-n, --lines': '<count>' };

const head = (state, commandOptions) =>
{
  const {argv, options} = parseOptions(commandOptions, optDef);

  if(argv.length === 0) return {};

  const filePath = relativeToAbsolutePath(state, argv[0]);
  const headTrimmingFn = (lines, lineCount) => lines.slice(0, lineCount);
  const {content, err} = trimFileContent(state.getFileSystem(), filePath, options, headTrimmingFn);

  if(err) return { output: OutputFactory.makeErrorOutput(err) };

  return { output: OutputFactory.makeTextOutput(content) };
};

export default head;
