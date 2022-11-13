import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { Filters } from "./components/Filters";
import { Scenes } from "./components/Scenes";
import { OBSContextProvider } from "./context/obsProvider";
import { Audios } from "./components/Audios";

const url = new URL(window.location.href);
const host = url.searchParams.get("host") || "192.168.0.170:4455";
const password = url.searchParams.get("password") || "jKSzkekOUtI5DwXA";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OBSContextProvider host={host} password={password}>
      <div className="space-y-4">
        <Scenes />
        <Filters />
        <Audios />
      </div>
    </OBSContextProvider>
  </React.StrictMode>
);
