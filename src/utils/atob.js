const atob = (b64Encoded) => Buffer.from(b64Encoded, "base64").toString();
export default atob;
