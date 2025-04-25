import { Select } from "@mantine/core";
import { useState } from "react";
import type { IfeoDataValue } from ".";
import { REGISTRY_DATA_TYPES } from "../constants";

export default function PagePriorityField({ data }: { data: IfeoDataValue }) {
  const [value, setValue] = useState<string | null>(
    data.PagePriority?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "Very Low", value: "1" },
        { label: "Low", value: "2" },
        { label: "Medium", value: "3" },
        { label: "Below Normal", value: "4" },
        { label: "Normal", value: "5" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(
              "HKLM",
              data.Path + "\\PerfOptions",
              "PagePriority"
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
              data.Path + "\\PerfOptions",
              "PagePriority",
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
