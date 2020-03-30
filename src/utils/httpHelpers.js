export const get = (url = "", options_ = {}) => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "GET" },
  };
  return fetch(url, options).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
};

export const remove = (url = "", _data = {}, options_ = {}) => {
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
  return fetch(url, options).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
};
