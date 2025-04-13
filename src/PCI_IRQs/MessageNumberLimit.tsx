import { NumberInput } from "@mantine/core";
import { useState } from "react";
import type { SystemInfo } from ".";
import { MSI_PATH, REGISTRY_DATA_TYPES } from "../constants";

export default function MessageNumberLimitField({
  device,
}: {
  device: SystemInfo["devices"][number];
}) {
  const [value, setValue] = useState<number | undefined>(
    device.MessageNumberLimit ?? undefined
  );

  return (
    <NumberInput
      value={value}
      allowDecimal={false}
      allowNegative={false}
      clampBehavior="strict"
      min={0}
      hideControls
      onChange={(value) => {
        if (typeof value === "string") {
          window.pywebview.api
            .deleteRegistryValue(device.Path + MSI_PATH, "MessageNumberLimit")
            .then(() => {
              setValue(undefined);
            })
            .catch((error: unknown) => {
              alert(error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              device.Path + MSI_PATH,
              "MessageNumberLimit",
              REGISTRY_DATA_TYPES.REG_DWORD,
              value
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
