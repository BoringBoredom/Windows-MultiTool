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
        { label: "IrqPolicyMachineDefault", value: "0" },
        { label: "IrqPolicyAllCloseProcessors", value: "1" },
        { label: "IrqPolicyOneCloseProcessor", value: "2" },
        { label: "IrqPolicyAllProcessorsInMachine", value: "3" },
        { label: "IrqPolicySpecifiedProcessors", value: "4" },
        {
          label: "IrqPolicySpreadMessagesAcrossAllProcessors",
          value: "5",
        },
        {
          label: "IrqPolicyAllProcessorsInMachineWhenSteered",
          value: "6",
        },
      ]}
      onChange={(value) => {
        if (value === null) {
          window.pywebview.api
            .deleteRegistryValue(device.Path + AFFINITY_PATH, "DevicePolicy")
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
              "DevicePolicy",
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
