

export const addRecord = (outputs, outputRecord) =>
{
  if(!outputRecord.has('type'))
  {
    throw new Error('Output Record Must Include Type');
  }

  if(!outputRecord.has('content'))
  {
    throw new Error('Output Record Must Include Content');
  }

  return outputs.push(outputRecord);
};
