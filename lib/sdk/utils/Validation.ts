/* eslint-disable @typescript-eslint/no-explicit-any */

export const validate = async (params: { [key: string]: any }, mandatoryParams: string[]): Promise<true> => {
  const paramKeys = Object.keys(params);

  mandatoryParams.forEach(prop => {
    if (!paramKeys.includes(prop)) {
      return Promise.reject(new Error(`${prop} is missing`));
    }
    if (params[prop] === '') {
      return Promise.reject(new Error(`${prop} should not be empty`));
    }
  });

  return true;
}
