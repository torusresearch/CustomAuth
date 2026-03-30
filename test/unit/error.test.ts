import { describe, expect, it } from "vitest";

import { CustomAuthLoginError, CustomAuthLoginErrorPrefix, serializeError } from "../../src/utils/error";

describe("error utils", () => {
  describe("serializeError", () => {
    it("returns the original Error instance", async () => {
      const originalError = new Error("popup blocked");

      const serializedError = await serializeError(originalError);

      expect(serializedError).toBe(originalError);
    });
  });

  describe("CustomAuthLoginError", () => {
    it("exports the expected login error prefix", () => {
      expect(CustomAuthLoginErrorPrefix).toBe("CustomAuthLoginError: login failure.");
    });

    it("creates a named error that preserves the message", () => {
      const error = new CustomAuthLoginError(`${CustomAuthLoginErrorPrefix} popup blocked`);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CustomAuthLoginError);
      expect(error.name).toBe("CustomAuthLoginError");
      expect(error.message).toBe("CustomAuthLoginError: login failure. popup blocked");
    });
  });
});
