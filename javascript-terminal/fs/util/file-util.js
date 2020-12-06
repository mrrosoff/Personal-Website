export const isFile = (map) =>
{
  return map.content;
};

export const isDirectory = (map) =>
{
  return !map.content;
};

export const makeFile = (content = '', metadata = {}) =>
{
  return {content, ...metadata};
};

export const makeDirectory = (metadata = {}) =>
{
  return metadata;
};
