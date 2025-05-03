import { NumberInput } from "@mantine/core";
import { useState } from "react";
import type { Setting } from ".";

export default function NumberOption({
  setting,
  type,
  schemeGuid,
  subgroupGuid,
}: {
  setting: Setting;
  type: "ac" | "dc";
  schemeGuid: string;
  subgroupGuid: string;
}) {
  const [value, setValue] = useState<number | string>(setting[type]);
  const { range } = setting;

  return (
    <NumberInput
      size="xs"
      label={type.toUpperCase()}
      value={value}
      onChange={(value) => {
        if (typeof value === "number") {
          window.pywebview.api
            .writeValueIndex(
              schemeGuid,
              subgroupGuid,
              setting.guid,
              value,
              type === "ac"
            )
            .then(() => {
              setValue(value);
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        } else {
          setValue(value);
        }
      }}
      min={range !== null ? range.min : 0}
      max={range !== null ? range.max : undefined}
      step={range !== null ? range.increment : undefined}
      clampBehavior="strict"
      allowNegative={false}
      allowDecimal={false}
      stepHoldDelay={250}
      stepHoldInterval={1}
    />
  );
}
