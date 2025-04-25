import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import type { CompatibilityOptions, CompatibilityOptionsData } from ".";
import { REGISTRY_DATA_TYPES } from "../constants";
import { COMPAT_PATH } from "./Table";
import s from "./index.module.css";

export default function AddPath({
  hiveStr,
  compatibilityOptionsData,
  setCompatibilityOptionsData,
}: {
  hiveStr: "HKLM" | "HKCU";
  compatibilityOptionsData: CompatibilityOptionsData;
  setCompatibilityOptionsData: React.Dispatch<
    React.SetStateAction<CompatibilityOptionsData | undefined>
  >;
}) {
  const [name, setName] = useState<string>("");

  return (
    <Group>
      <Button
        size="xs"
        variant="filled"
        color="green"
        onClick={() => {
          if (!name.trim()) {
            alert("Enter a process path.");
            return;
          }

          if (compatibilityOptionsData[hiveStr].get(name)) {
            alert(`"${name}" already exists.`);
            return;
          }

          window.pywebview.api
            .writeRegistryValue(
              hiveStr,
              COMPAT_PATH,
              name,
              REGISTRY_DATA_TYPES.REG_SZ,
              ""
            )
            .then(() => {
              setCompatibilityOptionsData((prev) => {
                if (!prev) {
                  return prev;
                }

                const newData = { ...prev };
                newData[hiveStr] = new Map(prev[hiveStr]);
                newData[hiveStr].set(
                  name,
                  Array(10).fill(null) as CompatibilityOptions
                );

                return newData;
              });

              setName("");
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        }}
      >
        +
      </Button>

      <TextInput
        value={name}
        className={s.addPath}
        placeholder="Enter process path"
        onChange={(ev) => {
          setName(ev.currentTarget.value);
        }}
      />
    </Group>
  );
}
