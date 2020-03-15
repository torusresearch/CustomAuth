import log from "loglevel";

export const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeout]);
};

export const post = (url = "", data = {}, options_ = {}) => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "POST" }
  };
  return promiseTimeout(
    30000,
    fetch(url, options).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
  );
};

export const remove = (url = "", _data = {}, options_ = {}) => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "DELETE" }
  };
  return fetch(url, options).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
};

export const get = (url = "", options_ = {}) => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache"
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "GET" }
  };
  return fetch(url, options).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
};

export const patch = (url = "", data = {}, options_ = {}) => {
  const defaultOptions = {
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  };
  const options = {
    ...defaultOptions,
    ...options_,
    ...{ method: "PATCH" }
  };
  return fetch(url, options).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw response;
  });
};

export const generateJsonRPCObject = (method, parameters) => ({
  jsonrpc: "2.0",
  method,
  id: 10,
  params: parameters
});

export const promiseRace = (url, options, timeout) => {
  log.info("promise race", url);
  return Promise.race([
    get(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("timeout"));
      }, timeout);
    })
  ]);
};
