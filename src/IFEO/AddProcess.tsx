import { ActionIcon, Group, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { IFEO_PATH, type IfeoData } from ".";
import s from "./index.module.css";

export default function AddNewProcess({
  ifeoData,
  setIfeoData,
}: {
  ifeoData: IfeoData;
  setIfeoData: React.Dispatch<React.SetStateAction<IfeoData | undefined>>;
}) {
  const [name, setName] = useState<string>("");

  return (
    <Group>
      <ActionIcon
        variant="filled"
        color="green"
        onClick={() => {
          if (!name.trim()) {
            alert("Enter a process name.");
            return;
          }

          const lowerCaseName = name.toLowerCase();
          const normalizedName = lowerCaseName.endsWith(".exe")
            ? name
            : name + ".exe";

          if (ifeoData.get(normalizedName)) {
            alert(`${normalizedName} already exists.`);
            return;
          }

          const path = `${IFEO_PATH}\\${normalizedName}`;

          window.pywebview.api
            .createRegistryKey(path + "\\PerfOptions")
            .then(() => {
              setIfeoData((prev) => {
                if (!prev) {
                  return prev;
                }

                const newData = new Map(prev);
                newData.set(normalizedName, {
                  Path: path,
                  CpuPriorityClass: null,
                  IoPriority: null,
                  PagePriority: null,
                });

                return newData;
              });

              setName("");
            })
            .catch((error: unknown) => {
              alert(error instanceof Error ? error.toString() : error);
            });
        }}
      >
        <IconPlus />
      </ActionIcon>

      <TextInput
        value={name}
        className={s.addProcess}
        placeholder="Enter process name"
        onChange={(ev) => {
          setName(ev.currentTarget.value);
        }}
      />
    </Group>
  );
}
