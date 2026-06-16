import React from "react";
import VodPage from "./pages/VodPage";
import VodHolderPage from "./pages/VodHolderPage";

function getAppRoute() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const pathname = window.location.pathname;
  const normalizedPath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
  const route = normalizedPath.replace(/\/+$/, "") || "/";

  if (
    route === "/vod-holder" ||
    route === "/prototype/vod-holder" ||
    window.location.hash === "#/vod-holder" ||
    new URLSearchParams(window.location.search).get("prototype") === "holder"
  ) {
    return "holder";
  }

  return "vod";
}

export default function App() {
  return getAppRoute() === "holder" ? <VodHolderPage /> : <VodPage />;
}
