export const serializeError = async (error: unknown): Promise<Error> => {
  // Find first Error or create an "unknown" Error to keep stack trace.
  const isError = error instanceof Error;
  const isString = typeof error === "string";
  const isApiErrorIndex = error && typeof error === "object" && "status" in error && "type" in error;
  let err: Error;
  if (isApiErrorIndex) {
    const apiError = error as Response;
    const contentType = apiError.headers.get("content-type");
    if (contentType.includes("application/json")) {
      const errJson = await apiError.json();
      err = new Error(errJson?.error || errJson?.message || JSON.stringify(errJson));
    } else if (contentType.includes("text/plain")) {
      err = new Error(await apiError.text());
    } else {
      err = new Error(`${apiError.status} ${apiError.type.toString()} ${apiError.statusText}`);
    }
  } else if (isString) {
    err = new Error(error as string);
  } else if (isError) {
    err = error as Error;
  } else {
    err = new Error("Unknown error");
  }
  return err;
};
