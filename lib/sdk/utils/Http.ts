/* eslint-disable @typescript-eslint/no-explicit-any */

async function buildHeader({ token }: HttpOpts) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (token) {
    headers.append('Authorization', `JWT ${await token}`)
  }

  return headers;
}

interface HttpOpts {
  token?: string | Promise<string>;
}

const formatResponse = async <T = any>(res: Response): Promise<T> => {
  const body = await res
    .clone()
    .json()
    .catch(() => ({}))

  if (res.ok) {
    return body;
  }

  return Promise.reject(body);
};

export const get = async <T = any>(url: string, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'GET',
      headers: await buildHeader(opts),
    })
    .then(formatResponse)
}

export const del = async <T = any>(url: string, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'DELETE',
      headers: await buildHeader(opts),
    })
    .then(formatResponse)
}

export const post = async <T = any>(url: string, body = {}, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'POST',
      headers: await buildHeader(opts),
      body: JSON.stringify(body),
    })
    .then(formatResponse)
}

export const put = async <T = any>(url: string, body = {}, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'PUT',
      headers: await buildHeader(opts),
      body: JSON.stringify(body),
    })
    .then(formatResponse)
}
