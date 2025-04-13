import { Select } from "@mantine/core";
import { useState } from "react";
import type { SystemInfo } from ".";
import { AFFINITY_PATH, REGISTRY_DATA_TYPES } from "../constants";

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
        { label: "IrqPriorityUndefined", value: "0" },
        { label: "IrqPriorityLow", value: "1" },
        { label: "IrqPriorityNormal", value: "2" },
        { label: "IrqPriorityHigh", value: "3" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(device.Path + AFFINITY_PATH, "DevicePriority")
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              device.Path + AFFINITY_PATH,
              "DevicePriority",
              REGISTRY_DATA_TYPES.REG_DWORD,
              parseInt(value)
            )
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error);
            });
        }
      }}
    />
  );
}
