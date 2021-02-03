import { CreateHandlerParams, ILoginHandler } from "./interfaces";
declare const createHandler: ({ clientId, redirect_uri, typeOfLogin, verifier, jwtParams, redirectToOpener, uxMode, }: CreateHandlerParams) => ILoginHandler;
export default createHandler;
