import { Table } from "@mantine/core";
import { useEffect, useState } from "react";
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
    <Table withColumnBorders>
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
  );
}
