import { Select } from "@mantine/core";
import { useState } from "react";
import type { IfeoDataValue } from ".";
import { REGISTRY_DATA_TYPES } from "../constants";

export default function IoPriorityField({ data }: { data: IfeoDataValue }) {
  const [value, setValue] = useState<string | null>(
    data.IoPriority?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "Very Low", value: "0" },
        { label: "Low", value: "1" },
        { label: "Normal", value: "2" },
        { label: "High", value: "3" },
        { label: "Critical", value: "4" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(data.Path + "\\PerfOptions", "IoPriority")
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
              "IoPriority",
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
