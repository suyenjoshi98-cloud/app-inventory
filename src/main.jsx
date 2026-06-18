import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
// import { sendOrderConfirmation } from "./email"; // ← fixed

// sendOrderConfirmation(
//   {
//     id: "TEST-001",
//     date: "2025-01-01",
//     total: 999,
//     items: [{ name: "Test Item", qty: 1, price: 999 }],
//   },
//   {
//     name: "Test User",
//     email: "youremail@gmail.com", // ← your real email
//   },
// ).then((result) => {
//   console.log("Result:", result);
// });

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </MantineProvider>,
);
