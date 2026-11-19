import { describe, expect, it } from "vite-plus/test";

import { handleRedirectParameters } from "../../src/utils/helpers";

describe("handleRedirectParameters", () => {
  it("parses hash key/value pairs", () => {
    const { hashParameters } = handleRedirectParameters("access_token=abc&id_token=def&flag", {});
    expect(hashParameters).toEqual({ access_token: "abc", id_token: "def", flag: "" });
  });

  it("does not let a __proto__ key pollute the prototype", () => {
    const { hashParameters } = handleRedirectParameters("__proto__=polluted&a=1", {});
    expect(Object.getPrototypeOf(hashParameters)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(hashParameters, "__proto__")).toBe(true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(hashParameters.a).toBe("1");
  });
});
