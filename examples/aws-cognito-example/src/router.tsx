import "./App.css";

import { Route, Switch } from "react-router-dom";

import HostedUIResultHandler from "./hosted-ui-redirect";
import HomePage from "./App";

function App() {
  return (
    <Switch>
      <Route path="/" exact>
        <HomePage />
      </Route>
      <Route path="/redirect" exact>
        <HostedUIResultHandler />
      </Route>
    </Switch>
  );
}

export default App;
