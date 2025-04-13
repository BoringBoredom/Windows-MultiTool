import { Select } from "@mantine/core";
import { useState } from "react";
import type { IfeoDataValue } from ".";
import { REGISTRY_DATA_TYPES } from "../constants";

export default function CpuPriorityField({ data }: { data: IfeoDataValue }) {
  const [value, setValue] = useState<string | null>(
    data.CpuPriorityClass?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "Idle", value: "1" },
        { label: "Below Normal", value: "5" },
        { label: "Normal", value: "2" },
        { label: "Above Normal", value: "6" },
        { label: "High", value: "3" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(
              data.Path + "\\PerfOptions",
              "CpuPriorityClass"
            )
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              data.Path + "\\PerfOptions",
              "CpuPriorityClass",
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
