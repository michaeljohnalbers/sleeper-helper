import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

import App from "./components/App";

const root = createRoot(document.getElementById("root"));
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
