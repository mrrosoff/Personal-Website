export const isFile = (obj) =>
{
  return obj.type === "-";
};

export const isDirectory = (obj) =>
{
  return obj.type === "d";
};

export const isSymbolicLink = (obj) =>
{
  return obj.type === "l";
};

export const makeEmptyFile = () =>
{
  return {type: "-", permissions: "rwx------", content: ""}
}


export const makeEmptyDirectory = () =>
{
  return {type: "d", permissions: "rwx------", content: {}}
}

export default {isFile, isDirectory, isSymbolicLink, makeEmptyFile, makeEmptyDirectory};
