import { Select } from "@mantine/core";
import { useState } from "react";
import type { SystemInfo } from ".";
import { MSI_PATH, REGISTRY_DATA_TYPES } from "../constants";

export default function MSISupportedField({
  device,
}: {
  device: SystemInfo["devices"][number];
}) {
  const [value, setValue] = useState<string | null>(
    device.MSISupported?.toString() ?? null
  );

  return (
    <Select
      clearable
      value={value}
      data={[
        { label: "On", value: "1" },
        { label: "Off", value: "0" },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(device.Path + MSI_PATH, "MSISupported")
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              device.Path + MSI_PATH,
              "MSISupported",
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
