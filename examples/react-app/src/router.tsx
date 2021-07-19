import "./App.css";

import { Route, Switch } from "react-router-dom";

import PopupModePage from "./popupMode/login";
import RedirectModePage from "./redirectMode/login";
import RedirectResultHandler from "./redirectMode/auth";

import HomePage from "./App";

function App() {
  return (
    <Switch>
      <Route path="/" exact>
        <HomePage />
      </Route>
      <Route path="/popupMode" exact>
        <PopupModePage />
      </Route>
      <Route path="/redirectMode" exact>
        <RedirectModePage />
      </Route>
      <Route path="/auth" exact>
        <RedirectResultHandler />
      </Route>
    </Switch>
  );
}

export default App;
