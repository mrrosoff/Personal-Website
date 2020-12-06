
export const create = (defaultVariables = {}, cwd = '/') =>
{
  if(!cwd && !defaultVariables.hasOwnProperty('cwd'))
  {
    throw new Error("Failed to create environment variables. Missing 'cwd' (current working directory).");
  }

  return { 'cwd': cwd, ...defaultVariables };
};

export const getEnvironmentVariable = (environmentVariables, key) =>
{
  return environmentVariables[key];
};

export const setEnvironmentVariable = (environmentVariables, key, val) =>
{
  environmentVariables[key] = val;
};

export default {create, getEnvironmentVariable, setEnvironmentVariable};
