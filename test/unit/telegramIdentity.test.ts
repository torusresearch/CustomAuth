import { encodeBase64Url } from "@toruslabs/metadata-helpers";
import { describe, expect, it } from "vitest";

import { assertTelegramVerifierId, telegramUserIdFromIdToken } from "../../src/utils/helpers";

const widgetToken = (id: number | string) =>
  encodeBase64Url(JSON.stringify({ id, auth_date: 1737103331, first_name: "Ada", hash: "abc" }));

describe("telegramUserIdFromIdToken", () => {
  it("reads the widget id from a base64url JSON token", () => {
    expect(telegramUserIdFromIdToken(widgetToken(111))).toBe("111");
  });

  it("rejects an empty token", () => {
    expect(() => telegramUserIdFromIdToken("")).toThrow("Telegram user id not found in idToken");
  });

  it("rejects a token with no id", () => {
    expect(() => telegramUserIdFromIdToken(encodeBase64Url(JSON.stringify({ first_name: "Ada" })))).toThrow(
      "Telegram user id not found in idToken"
    );
  });

  it("rejects a zero id and a leading zero", () => {
    expect(() => telegramUserIdFromIdToken(widgetToken(0))).toThrow("Telegram user id not found in idToken");
    expect(() => telegramUserIdFromIdToken(widgetToken("01"))).toThrow("Telegram user id not found in idToken");
  });
});

describe("assertTelegramVerifierId", () => {
  it("accepts an equal decimal id", () => {
    expect(() => assertTelegramVerifierId("111", widgetToken(111))).not.toThrow();
  });

  it("rejects a different id", () => {
    expect(() => assertTelegramVerifierId("222", widgetToken(111))).toThrow("verifier ID does not match Telegram user ID");
  });

  it("rejects extra characters around the id", () => {
    expect(() => assertTelegramVerifierId("111 ", widgetToken(111))).toThrow("verifier ID does not match Telegram user ID");
    expect(() => assertTelegramVerifierId("telegram|111", widgetToken(111))).toThrow("verifier ID does not match Telegram user ID");
  });
});
