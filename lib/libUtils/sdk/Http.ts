function defaultHeaders(opts: HttpOpts) {
  const token = opts.auth ? localStorage.getItem('token') : null;

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (token) {
    headers.append('Authorization', `JWT ${token}`)
  }

  return headers;
}

interface HttpOpts {
  auth?: boolean;
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
      headers: defaultHeaders(opts),
    })
    .then(formatResponse)
}

export const del = async <T = any>(url: string, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'DELETE',
      headers: defaultHeaders(opts),
    })
    .then(formatResponse)
}

export const post = async <T = any>(url: string, body = {}, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'POST',
      headers: defaultHeaders(opts),
      body: JSON.stringify(body),
    })
    .then(formatResponse)
}

export const put = async <T = any>(url: string, body = {}, opts: HttpOpts = {}): Promise<T> => {
  return fetch(url, {
      method: 'PUT',
      headers: defaultHeaders(opts),
      body: JSON.stringify(body),
    })
    .then(formatResponse)
}
