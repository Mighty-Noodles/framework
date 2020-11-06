import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

function getFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  if (process.env.NODE_ENV === 'test') {
    return Promise.reject('Do not use \'fetch\' in test');
  }

  return fetch(url, init);
}

export interface IHttp {
  get?: (url: string) => Promise<Response>;
  post?: (url: string, body: Record<string, unknown>) => Promise<Response>;
  put?: (url: string, body: Record<string, unknown>) => Promise<Response>;
  delete?: (url: string) => Promise<Response>;
}

export interface HttpInject {
  http?: IHttp;
}

export interface HttpService {
  http: IHttp;
}

export class Http implements IHttp {
  fetch: typeof fetch;

  constructor(fetchFn?: typeof fetch) {
    this.fetch = fetchFn || getFetch as typeof fetch;
  }

  get(url: string): Promise<Response> {
    return this.fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
  }

  post(url: string, body: Record<string, unknown>): Promise<Response> {
    return this.fetch(url, {
        method: 'POST',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
  }

  put(url: string, body: Record<string, unknown>): Promise<Response> {
    return this.fetch(url, {
        method: 'PUT',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
  }

  delete(url: string): Promise<Response> {
    return this.fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
