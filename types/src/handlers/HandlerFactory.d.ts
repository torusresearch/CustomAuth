import { CreateHandlerParams, ILoginHandler } from "./interfaces";
declare const createHandler: ({ clientId, redirect_uri, typeOfLogin, verifier, jwtParams, redirectToOpener, uxMode, customState, registerOnly, }: CreateHandlerParams) => ILoginHandler;
export default createHandler;
