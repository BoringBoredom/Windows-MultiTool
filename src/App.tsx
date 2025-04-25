import { AppShell, Button, Center, NavLink } from "@mantine/core";
import { useEffect, useState } from "react";
import packageJson from "../package.json";
import COMPATIBILITY_OPTIONS, {
  type CompatibilityOptionsData,
} from "./COMPATIBILITY_OPTIONS";
import DISPLAY_INFO, { type DisplayInfo } from "./DISPLAY_INFO";
import IFEO, { type IfeoData } from "./IFEO";
import PCI_IRQs, { type SystemInfo } from "./PCI_IRQs";
import POWER_SETTINGS, { type PowerSettings } from "./POWER_SETTINGS";
import SCHEDULING, { type SchedulingInfo } from "./SCHEDULING";

declare global {
  interface Window {
    pywebview: {
      api: {
        openURL: (url: string) => Promise<void>;
        getSystemInfo: () => Promise<SystemInfo>;
        getDisplayInfo: () => Promise<DisplayInfo>;
        getIfeoData: () => Promise<IfeoData>;
        getSchedulingInfo: () => Promise<SchedulingInfo>;
        getPowerSettings: () => Promise<PowerSettings>;
        writeValueIndex: (
          schemeGuidStr: string,
          subgroupGuidStr: string,
          settingGuidStr: string,
          valueIndex: number,
          isAc: boolean
        ) => Promise<void>;
        setActiveScheme: (schemeGuidStr: string) => Promise<void>;
        writeRegistryValue: (
          hkeyStr: "HKLM" | "HKCU",
          path: string,
          name: string,
          type: number,
          value: number | string
        ) => Promise<void>;
        deleteRegistryValue: (
          hkeyStr: "HKLM" | "HKCU",
          path: string,
          value: string
        ) => Promise<void>;
        deleteRegistryKey: (path: string, key: string) => Promise<void>;
        createRegistryKey: (path: string) => Promise<void>;
        getCompatibilityOptions: () => Promise<CompatibilityOptionsData>;
      };
    };
  }
}

const navItems = [
  { name: "PCI IRQs", component: <PCI_IRQs /> },
  { name: "Display Info", component: <DISPLAY_INFO /> },
  { name: "IFEO", component: <IFEO /> },
  { name: "Scheduling", component: <SCHEDULING /> },
  { name: "Power Settings", component: <POWER_SETTINGS /> },
  { name: "Compatibility Options", component: <COMPATIBILITY_OPTIONS /> },
] as const;

export default function App() {
  const [apiReady, setApiReady] = useState(false);
  const [active, setActive] = useState<
    (typeof navItems)[number]["name"] | undefined
  >();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    window.addEventListener("pywebviewready", () => {
      setApiReady(true);
    });

    fetch(`https://api.github.com/repos/${packageJson.repo}/releases/latest`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then((data: { tag_name: string }) => {
        if (data.tag_name !== packageJson.version) {
          setUpdateAvailable(true);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, []);

  if (!apiReady) {
    return;
  }

  return (
    <>
      <AppShell.Navbar>
        {navItems.map((item) => {
          const { name } = item;

          return (
            <NavLink
              key={name}
              label={name}
              active={active === name}
              onClick={() => {
                setActive(name);
              }}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        {active
          ? navItems.find((item) => item.name === active)?.component
          : updateAvailable && (
              <Center h="100vh">
                <Button
                  variant="filled"
                  color="green"
                  size="xl"
                  onClick={() => {
                    window.pywebview.api
                      .openURL(
                        "https://github.com/" +
                          packageJson.repo +
                          "/releases/latest"
                      )
                      .catch((error: unknown) => {
                        alert(
                          error instanceof Error ? error.toString() : error
                        );
                      });
                  }}
                >
                  Update available
                </Button>
              </Center>
            )}
      </AppShell.Main>
    </>
  );
}
