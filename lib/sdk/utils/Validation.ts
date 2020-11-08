/* eslint-disable @typescript-eslint/no-explicit-any */

export const validate = (params: { [key: string]: any }, mandatoryParams: string[]): boolean => {
  const paramKeys = Object.keys(params);

  mandatoryParams.forEach(prop => {
    if (!paramKeys.includes(prop)) {
      throw(new Error(`${prop} is missing`));
    }
    if (params[prop] === '') {
      throw(new Error(`${prop} should not be empty`));
    }
  });

  return true;
}
