import { Checkbox, Select, Table } from "@mantine/core";
import { useState } from "react";
import type { CompatibilityOptions } from ".";
import { REGISTRY_DATA_TYPES } from "../constants";
import { COMPAT_PATH } from "./Table";

export default function Options({
  name,
  compatibilityOptions,
  hiveStr,
}: {
  name: string;
  compatibilityOptions: CompatibilityOptions;
  hiveStr: "HKLM" | "HKCU";
}) {
  const [data, setData] = useState<CompatibilityOptions>([
    ...compatibilityOptions,
  ]);

  return (
    <>
      <Table.Td>
        <Checkbox
          checked={data[0] === "~"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[0] = ev.currentTarget.checked ? "~" : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[1] === "DISABLEDXMAXIMIZEDWINDOWEDMODE"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[1] = ev.currentTarget.checked
              ? "DISABLEDXMAXIMIZEDWINDOWEDMODE"
              : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[2] === "RUNASADMIN"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[2] = ev.currentTarget.checked ? "RUNASADMIN" : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[3] === "640X480"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[3] = ev.currentTarget.checked ? "640X480" : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Select
          clearable
          value={data[4]}
          data={["PERPROCESSSYSTEMDPIFORCEOFF", "PERPROCESSSYSTEMDPIFORCEON"]}
          onChange={(value) => {
            const newData: CompatibilityOptions = [...data];
            newData[4] = value as (typeof newData)[4];

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Select
          clearable
          value={data[5]}
          data={["HIGHDPIAWARE", "DPIUNAWARE", "GDIDPISCALING DPIUNAWARE"]}
          onChange={(value) => {
            const newData: CompatibilityOptions = [...data];
            newData[5] = value as (typeof newData)[5];

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[6] === "256COLOR"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[6] = ev.currentTarget.checked ? "256COLOR" : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[7] === "16BITCOLOR"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[7] = ev.currentTarget.checked ? "16BITCOLOR" : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Checkbox
          checked={data[8] === "TRANSFORMLEGACYCOLORMANAGED"}
          onChange={(ev) => {
            const newData: CompatibilityOptions = [...data];
            newData[8] = ev.currentTarget.checked
              ? "TRANSFORMLEGACYCOLORMANAGED"
              : null;

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>

      <Table.Td>
        <Select
          clearable
          value={data[9]}
          data={[
            "WIN95",
            "WIN98",
            "WINXPSP2",
            "WINXPSP3",
            "VISTARTM",
            "VISTASP1",
            "VISTASP2",
            "WIN7RTM",
            "WIN8RTM",
          ]}
          onChange={(value) => {
            const newData: CompatibilityOptions = [...data];
            newData[9] = value as (typeof newData)[9];

            window.pywebview.api
              .writeRegistryValue(
                hiveStr,
                COMPAT_PATH,
                name,
                REGISTRY_DATA_TYPES.REG_SZ,
                newData.filter((x) => x !== null).join(" ")
              )
              .then(() => {
                setData(newData);
              })
              .catch((error: unknown) => {
                alert(error instanceof Error ? error.toString() : error);
              });
          }}
        />
      </Table.Td>
    </>
  );
}
