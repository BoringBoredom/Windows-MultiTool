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
  }[];
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
        alert(error);
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
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
