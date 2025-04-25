import { Select } from "@mantine/core";
import { useState } from "react";
import type { SystemInfo } from ".";
import { AFFINITY_PATH, REGISTRY_DATA_TYPES } from "../constants";

export default function DevicePolicyField({
  device,
}: {
  device: SystemInfo["devices"][number];
}) {
  const [value, setValue] = useState<string | null>(
    device.DevicePolicy?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "Machine Default", value: "0" },
        { label: "All Close Processors", value: "1" },
        { label: "One Close Processor", value: "2" },
        { label: "All Processors In Machine", value: "3" },
        { label: "Specified Processors", value: "4" },
        {
          label: "Spread Messages Across All Processors",
          value: "5",
        },
        {
          label: "All Processors In Machine When Steered",
          value: "6",
        },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(
              "HKLM",
              device.Path + AFFINITY_PATH,
              "DevicePolicy"
            )
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              "HKLM",
              device.Path + AFFINITY_PATH,
              "DevicePolicy",
              REGISTRY_DATA_TYPES.REG_DWORD,
              parseInt(value)
            )
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        }
      }}
    />
  );
}
