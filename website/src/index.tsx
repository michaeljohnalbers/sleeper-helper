import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
//import "./style/style.css";

//import App from "./components/App";
import App from "./components/material/App"

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
