export const get = async <T>(url = "", options_: RequestInit = {}): Promise<T> => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "GET" },
  };
  const response = await fetch(url, options as RequestInit);
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  throw response;
};

export const remove = async <T>(url = "", options_: RequestInit = {}): Promise<T> => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "DELETE" },
  };
  const response = await fetch(url, options as RequestInit);
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  throw response;
};
