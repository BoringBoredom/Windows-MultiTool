import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { AppShell, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        navbar={{
          width: { base: 120 },
          breakpoint: 0,
        }}
        transitionDuration={0}
      >
        <App />
      </AppShell>
    </MantineProvider>
  </StrictMode>
);
