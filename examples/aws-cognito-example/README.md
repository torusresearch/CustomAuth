#  Using Torus CustomAuth with AWS Cognito

## Prerequisites :-
  - Set up your aws cognito user pool and app client
  - Set REACT_APP_COGNITO_CLIENT_ID to your aws cognito app client id in .env file
  - Set REACT_APP_AWS_COGNITO_USER_POOL_DOMAIN to your aws Cognito app hosted ui url.
  - Add http://localhost:3000/redirect in your aws cognito oauth settings as a `redirect_uri`.
  - Set up custom torus verifier from `https://developer.tor.us` and set your verifier name
  as REACT_APP_TORUS_VERIFIER_NAME env variable.

## To run this example:
- npm i
- npm start


## To know more about all configuration steps in details follow this guide to get started with Torus CustomAuth and aws cognito:-

`https://docs.tor.us/guides/customAuth-aws-cognito`
