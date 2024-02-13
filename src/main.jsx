import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/:codeBall",
    element: <App />
  },
  {
    path: '*',
    element: <center>
      <h1>404 Page Not Found</h1>
      <Link to="/">Go to Home</Link>
    </center>
  }
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>
);