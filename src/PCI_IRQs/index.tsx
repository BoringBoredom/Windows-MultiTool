import { Table } from "@mantine/core";
import { useEffect, useState } from "react";
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
    <Table withColumnBorders>
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
  );
}
