import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./screens/screens.css";
import App from "./App.jsx";
import { isInsideNuru } from "./lib/account";
import { readHandoff } from "./lib/handoff";

// An email + invite handed over by alke.network (URL fragment), read before the router runs.
readHandoff();

/* Inside the Nuru app the page already sits below Nuru's own bar, but its
   web view still reports the phone's status-bar inset, which doubled the
   space above our top bar. Mark the page so the CSS drops that inset.
   Nuru may inject its provider a moment after load, so check again. */
const markNuru = () => {
  if (isInsideNuru()) document.documentElement.classList.add("in-nuru");
};
markNuru();
window.addEventListener("ethereum#initialized", markNuru, { once: true });
setTimeout(markNuru, 500);
setTimeout(markNuru, 2000);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
