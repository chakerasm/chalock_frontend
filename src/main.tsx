import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers";
import { LoadingState } from "@/components/shared/LoadingState/LoadingState";
import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const routerPromise = initializeRouter();

function Application() {
  const [router, setRouter] = useState<ReturnType<typeof getRouter> | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    void routerPromise.then((initializedRouter) => {
      if (isMounted) setRouter(initializedRouter);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (router) return <RouterProvider router={router} />;

  return (
    <AppProviders>
      <LoadingState fullScreen />
    </AppProviders>
  );
}

async function initializeRouter() {
  if (import.meta.env.DEV) {
    const { worker } = await import("@/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  return getRouter();
}

createRoot(rootElement).render(
  <StrictMode>
    <Application />
  </StrictMode>,
);
