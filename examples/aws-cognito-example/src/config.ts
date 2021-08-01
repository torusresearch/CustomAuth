const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
const AWS_COGNITO_USER_POOL_DOMAIN = process.env.REACT_APP_AWS_COGNITO_USER_POOL_DOMAIN;
console.log("AWS_COGNITO_USER_POOL_DOMAIN", AWS_COGNITO_USER_POOL_DOMAIN);
export const AWS_COGNITO_LOGIN_PARAMS = {
  client_id: clientId,
  response_type: "token",
  scope: "email openid profile",
  redirect_uri: "http://localhost:3000/redirect",
};

export const AWS_COGNITO_LOGIN_ROUTE = `${AWS_COGNITO_USER_POOL_DOMAIN}/login`;

export const AWS_COGNITO_LOGOUT_PARAMS = {
  client_id: clientId,
  logout_uri: "http://localhost:3000",
};

export const AWS_COGNITO_LOGOUT_ROUTE = `${AWS_COGNITO_USER_POOL_DOMAIN}/logout`;

// Create your custom verifier at `https://developer.tor.us`
export const TORUS_DIRECT_SDK_VERIFIER_NAME = "torus-cognito-demo";
