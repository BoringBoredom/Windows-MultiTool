import { ActionIcon, Menu, Table } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import s2 from "../App.module.css";
import { formatBitMask, formatRegValue } from "../shared";
import AssignmentSetOverrideField from "./AssignmentSetOverride";
import DevicePolicyField from "./DevicePolicy";
import DevicePriorityField from "./DevicePriority";
import s from "./index.module.css";
import MessageNumberLimitField from "./MessageNumberLimit";
import MSISupportedField from "./MSISupported";

export interface SystemInfo {
  cpu: { cpus: number };
  devices: {
    DeviceId: string;
    Path: string;
    DeviceName: string;
    DevicePriority: number | null;
    DevicePolicy: number | null;
    AssignmentSetOverride: number | null;
    MessageNumberLimit: number | null;
    MSISupported: number | null;
    InterruptSupport: number | null;
    MaximumMessageNumberLimit: number | null;
  }[];
}

export const AFFINITY_PATH =
  "\\Device Parameters\\Interrupt Management\\Affinity Policy";
export const MSI_PATH =
  "\\Device Parameters\\Interrupt Management\\MessageSignaledInterruptProperties";

function getExportData(systemInfo: SystemInfo, isReg: boolean) {
  let content = "";

  if (isReg) {
    content += "Windows Registry Editor Version 5.00\n\n";

    for (const device of systemInfo.devices) {
      content +=
        `[HKEY_LOCAL_MACHINE\\${device.Path}${AFFINITY_PATH}]\n` +
        formatRegValue("DevicePriority", device.DevicePriority) +
        formatRegValue("DevicePolicy", device.DevicePolicy) +
        `"AssignmentSetOverride"=${formatBitMask(
          device.AssignmentSetOverride,
          true
        )}\n\n` +
        `[HKEY_LOCAL_MACHINE\\${device.Path}${MSI_PATH}]\n` +
        formatRegValue("MSISupported", device.MSISupported) +
        formatRegValue("MessageNumberLimit", device.MessageNumberLimit) +
        "\n";
    }
  } else {
    content +=
      "setlocal\n\n" +
      `set "AFFINITY_PATH=${AFFINITY_PATH}"\n` +
      `set "MSI_PATH=${MSI_PATH}"\n\n`;

    for (const device of systemInfo.devices) {
      content += `set "BASE=${device.Path}"\n\n`;

      const baseAddAffinity = `reg add "%BASE%%AFFINITY_PATH%"`;
      const baseDeleteAffinity = `reg delete "%BASE%%AFFINITY_PATH%"`;
      const baseAddMsi = `reg add "%BASE%%MSI_PATH%"`;
      const baseDeleteMsi = `reg delete "%BASE%%MSI_PATH%"`;

      if (device.DevicePriority !== null) {
        content += `${baseAddAffinity} /v DevicePriority /t REG_DWORD /d ${device.DevicePriority.toString()} /f \n`;
      } else {
        content += `${baseDeleteAffinity} /v DevicePriority /f \n`;
      }

      if (device.DevicePolicy !== null) {
        content += `${baseAddAffinity} /v DevicePolicy /t REG_DWORD /d ${device.DevicePolicy.toString()} /f \n`;
      } else {
        content += `${baseDeleteAffinity} /v DevicePolicy /f \n`;
      }

      if (device.AssignmentSetOverride !== null) {
        content += `${baseAddAffinity} /v AssignmentSetOverride /t REG_BINARY /d ${formatBitMask(
          device.AssignmentSetOverride,
          false
        )} /f \n`;
      } else {
        content += `${baseDeleteAffinity} /v AssignmentSetOverride /f \n`;
      }

      if (device.MSISupported !== null) {
        content += `${baseAddMsi} /v MSISupported /t REG_DWORD /d ${device.MSISupported.toString()} /f \n`;
      } else {
        content += `${baseDeleteMsi} /v MSISupported /f \n`;
      }

      if (device.MessageNumberLimit !== null) {
        content += `${baseAddMsi} /v MessageNumberLimit /t REG_DWORD /d ${device.MessageNumberLimit.toString()} /f \n`;
      } else {
        content += `${baseDeleteMsi} /v MessageNumberLimit /f \n`;
      }

      content += "\n";
    }

    content += "endlocal";
  }

  return content;
}

function formatInterruptSupport(value: number | null) {
  if (value === null) {
    return;
  }

  const supportedTypes: string[] = [];
  if (value & 0x1) {
    supportedTypes.push("Line");
  }
  if (value & 0x2) {
    supportedTypes.push("MSI");
  }
  if (value & 0x4) {
    supportedTypes.push("MSI-X");
  }

  return supportedTypes.length > 0 ? supportedTypes.join(", ") : "-";
}

export default function PCI_IRQs() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>();

  useEffect(() => {
    window.pywebview.api
      .getSystemInfo()
      .then((data) => {
        setSystemInfo(data);
      })
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.toString() : error);
      });
  }, []);

  if (!systemInfo) {
    return;
  }

  return (
    <>
      <div className={s2.menu}>
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
                window.pywebview.api
                  .saveFile(
                    "pci_irqs.reg",
                    ["Registry File (*.reg)"],
                    getExportData(systemInfo, true)
                  )
                  .catch((error: unknown) => {
                    alert(error instanceof Error ? error.toString() : error);
                  });
              }}
            >
              .reg
            </Menu.Item>

            <Menu.Item
              onClick={() => {
                window.pywebview.api
                  .saveFile(
                    "pci_irqs.bat",
                    ["Batch File (*.bat)"],
                    getExportData(systemInfo, false)
                  )
                  .catch((error: unknown) => {
                    alert(error instanceof Error ? error.toString() : error);
                  });
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
            <Table.Th>Device</Table.Th>
            <Table.Th>IRQ Priority</Table.Th>
            <Table.Th>IRQ Policy</Table.Th>
            <Table.Th>CPUs</Table.Th>
            <Table.Th>MSI</Table.Th>
            <Table.Th>Message Limit</Table.Th>
            <Table.Th>Max Limit</Table.Th>
            <Table.Th>Interrupt Type</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {systemInfo.devices.map((device) => (
            <Table.Tr key={device.DeviceId}>
              <Table.Td>
                {device.DeviceName}
                <div className={s.finePrint}>{device.DeviceId}</div>
              </Table.Td>

              <Table.Td>
                <DevicePriorityField device={device} />
              </Table.Td>

              <Table.Td>
                <DevicePolicyField device={device} />
              </Table.Td>

              <Table.Td>
                <AssignmentSetOverrideField
                  device={device}
                  cpus={systemInfo.cpu.cpus}
                />
              </Table.Td>

              <Table.Td>
                <MSISupportedField device={device} />
              </Table.Td>

              <Table.Td>
                <MessageNumberLimitField device={device} />
              </Table.Td>

              <Table.Td>{device.MaximumMessageNumberLimit}</Table.Td>

              <Table.Td>
                {formatInterruptSupport(device.InterruptSupport)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
