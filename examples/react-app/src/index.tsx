import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
import RouterPage from "./router";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <RouterPage />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
