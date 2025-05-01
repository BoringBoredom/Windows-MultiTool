import { NumberInput } from "@mantine/core";
import { useState } from "react";
import { MSI_PATH, type SystemInfo } from ".";
import { REGISTRY_DATA_TYPES } from "../shared";

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
            .deleteRegistryValue(
              "HKLM",
              device.Path + MSI_PATH,
              "MessageNumberLimit"
            )
            .then(() => {
              setValue(undefined);
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        } else {
          window.pywebview.api
            .writeRegistryValue(
              "HKLM",
              device.Path + MSI_PATH,
              "MessageNumberLimit",
              REGISTRY_DATA_TYPES.REG_DWORD,
              value
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
