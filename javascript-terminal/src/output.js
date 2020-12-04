export const TEXT_OUTPUT_TYPE = 'TEXT_OUTPUT';
export const IMG_OUTPUT_TYPE = 'IMG_OUTPUT';
export const TEXT_ERROR_OUTPUT_TYPE = 'TEXT_ERROR_OUTPUT';
export const HEADER_OUTPUT_TYPE = 'HEADER_OUTPUT_TYPE';

export const OutputRecord = {type: undefined, content: undefined};

export const makeHeaderOutput = (cwd, command) =>
{
  return new OutputRecord({type: HEADER_OUTPUT_TYPE, content: {cwd, command}});
};

export const makeTextOutput = (content) =>
{
  return new OutputRecord({ type: TEXT_OUTPUT_TYPE, content });
};

export const makeImgOutput = (content) =>
{
  return new OutputRecord({ type: IMG_OUTPUT_TYPE, content });
};

export const makeErrorOutput = (err) =>
{
  return new OutputRecord({ type: TEXT_ERROR_OUTPUT_TYPE, content: `${err.source}: ${err.type}`});
};
