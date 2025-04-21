/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NativeSelect } from "@mantine/core";
import { useState } from "react";
import type { Setting } from ".";

export default function SelectOption({
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
  const [value, setValue] = useState(setting.options![setting[type]].index);

  return (
    <NativeSelect
      label={type.toUpperCase()}
      value={value}
      data={setting.options!.map((option) => ({
        label: option.name,
        value: option.index.toString(),
      }))}
      onChange={(ev) => {
        const value = parseInt(ev.currentTarget.value);

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
      }}
    />
  );
}
