import "./App.css";

import { Route, Routes } from "react-router-dom";

import PopupModePage from "./popupMode/login";
import RedirectModePage from "./redirectMode/login";
import RedirectResultHandler from "./redirectMode/auth";
import HomePage from "./App";

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/popupMode" element={<PopupModePage />} />
      <Route path="/redirectMode" element={<RedirectModePage />} />
      <Route path="/auth" element={<RedirectResultHandler />} />
    </Routes>
  );
}

export default RouterPage;
