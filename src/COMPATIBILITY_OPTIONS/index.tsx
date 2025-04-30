import { ActionIcon, Menu, Table } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import s from "../App.module.css";
import TableComponent from "./Table";

export type CompatibilityOptions = [
  null | "~",
  null | "DISABLEDXMAXIMIZEDWINDOWEDMODE",
  null | "RUNASADMIN",
  null | "640X480",
  null | "PERPROCESSSYSTEMDPIFORCEOFF" | "PERPROCESSSYSTEMDPIFORCEON",
  null | "HIGHDPIAWARE" | "DPIUNAWARE" | "GDIDPISCALING DPIUNAWARE",
  null | "256COLOR",
  null | "16BITCOLOR",
  null | "TRANSFORMLEGACYCOLORMANAGED",
  (
    | null
    | "WIN95"
    | "WIN98"
    | "WINXPSP2"
    | "WINXPSP3"
    | "VISTARTM"
    | "VISTASP1"
    | "VISTASP2"
    | "WIN7RTM"
    | "WIN8RTM"
  )
];

export interface CompatibilityOptionsData {
  HKLM: HiveData;
  HKCU: HiveData;
}

type HiveData = Map<string, CompatibilityOptions>;

export const COMPAT_PATH =
  "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers";

function processHive(
  hive: HiveData,
  hiveKey: "HKEY_LOCAL_MACHINE" | "HKEY_CURRENT_USER",
  isReg: boolean
) {
  if (hive.size === 0) {
    return "";
  }

  const regPath = `${hiveKey}\\${COMPAT_PATH}`;

  let content = "";

  if (isReg) {
    content = `[${regPath}]\n`;
  } else {
    content = `set "REG_PATH=${regPath}"\n\n`;
  }

  for (const [name, options] of hive) {
    const value = options.filter((x) => x !== null).join(" ");

    if (value) {
      if (isReg) {
        const escapedName = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        content += `"${escapedName}"="${value}"\n`;
      } else {
        content += `reg add "%REG_PATH%" /v "${name}" /t REG_SZ /d "${value}" /f\n`;
      }
    }
  }

  return content + "\n";
}

export default function COMPATIBILITY_OPTIONS() {
  const [compatibilityOptionsData, setCompatibilityOptionsData] =
    useState<CompatibilityOptionsData>();

  useEffect(() => {
    window.pywebview.api
      .getCompatibilityOptions()
      .then((data) => {
        setCompatibilityOptionsData({
          HKLM: new Map(Object.entries(data.HKLM)) as HiveData,
          HKCU: new Map(Object.entries(data.HKCU)) as HiveData,
        });
      })
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.toString() : error);
      });
  }, []);

  if (!compatibilityOptionsData) {
    return;
  }

  return (
    <>
      <div className={s.menu}>
        <Menu>
          <Menu.Target>
            <ActionIcon size="xs" variant="default">
              <IconChevronDown />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>EXPORT</Menu.Label>
            <Menu.Item
              onClick={() => {
                const { HKLM, HKCU } = compatibilityOptionsData;

                if (HKLM.size !== 0 || HKCU.size !== 0) {
                  window.pywebview.api
                    .saveFile(
                      "compatibility_settings.reg",
                      ["Registry File (*.reg)"],
                      "Windows Registry Editor Version 5.00\n\n" +
                        processHive(HKLM, "HKEY_LOCAL_MACHINE", true) +
                        processHive(HKCU, "HKEY_CURRENT_USER", true)
                    )
                    .catch((error: unknown) => {
                      alert(error instanceof Error ? error.toString() : error);
                    });
                }
              }}
            >
              .reg
            </Menu.Item>

            <Menu.Item
              onClick={() => {
                const { HKLM, HKCU } = compatibilityOptionsData;

                if (HKLM.size !== 0 || HKCU.size !== 0) {
                  window.pywebview.api
                    .saveFile(
                      "compatibility_settings.bat",
                      ["Batch File (*.bat)"],
                      "setlocal\n\n" +
                        processHive(HKLM, "HKEY_LOCAL_MACHINE", false) +
                        processHive(HKCU, "HKEY_CURRENT_USER", false) +
                        "endlocal"
                    )
                    .catch((error: unknown) => {
                      alert(error instanceof Error ? error.toString() : error);
                    });
                }
              }}
            >
              .bat
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <Table withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Process Path</Table.Th>
            <Table.Th>~</Table.Th>
            <Table.Th>Disable FSO</Table.Th>
            <Table.Th>Run as admin</Table.Th>
            <Table.Th>Run in 640x480</Table.Th>
            <Table.Th>Override system DPI</Table.Th>
            <Table.Th>Override high DPI scaling behavior</Table.Th>
            <Table.Th>Reduce color mode (8-bit 256)</Table.Th>
            <Table.Th>Reduce color mode (16-bit 65536)</Table.Th>
            <Table.Th>Use legacy display ICC color management</Table.Th>
            <Table.Th>Windows version</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <TableComponent
          compatibilityOptionsData={compatibilityOptionsData}
          setCompatibilityOptionsData={setCompatibilityOptionsData}
          hiveStr="HKLM"
        />
        <TableComponent
          compatibilityOptionsData={compatibilityOptionsData}
          setCompatibilityOptionsData={setCompatibilityOptionsData}
          hiveStr="HKCU"
        />
      </Table>
    </>
  );
}
