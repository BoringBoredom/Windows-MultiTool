import { Select } from "@mantine/core";
import { useState } from "react";
import { AFFINITY_PATH, type SystemInfo } from ".";
import { REGISTRY_DATA_TYPES } from "../shared";

export default function DevicePriorityField({
  device,
}: {
  device: SystemInfo["devices"][number];
}) {
  const [value, setValue] = useState<string | null>(
    device.DevicePriority?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "Undefined", value: "0" },
        { label: "Low", value: "1" },
        { label: "Normal", value: "2" },
        { label: "High", value: "3" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(
              "HKLM",
              device.Path + AFFINITY_PATH,
              "DevicePriority"
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
              "DevicePriority",
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
