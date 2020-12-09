
export const create = (defaultVariables = {}, cwd = '/') =>
{
  if(!cwd && !defaultVariables.hasOwnProperty('cwd'))
  {
    throw new Error("Failed to create environment variables. Missing 'cwd' (current working directory).");
  }

  return { 'cwd': cwd, ...defaultVariables };
};

export default {create};
