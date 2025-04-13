import { Group, Button, TextInput } from "@mantine/core";
import { useState } from "react";
import type { IfeoData } from ".";

export default function AddNewProcess({
  ifeoData,
  setIfeoData,
}: {
  ifeoData: IfeoData | undefined;
  setIfeoData: React.Dispatch<React.SetStateAction<IfeoData | undefined>>;
}) {
  const [newProcessName, setNewProcessName] = useState<string>("");

  return (
    <Group>
      <Button
        size="xs"
        variant="filled"
        color="green"
        onClick={() => {
          if (!newProcessName.trim()) {
            alert("Enter a process name.");
            return;
          }

          const lowerCaseProcessName = newProcessName.toLowerCase();
          const normalizedProcessName = lowerCaseProcessName.endsWith(".exe")
            ? newProcessName
            : newProcessName + ".exe";

          if (ifeoData?.get(normalizedProcessName)) {
            alert(`${normalizedProcessName} already exists.`);
            return;
          }

          const path = `SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\${normalizedProcessName}`;

          window.pywebview.api
            .createRegistryKey(path + "\\PerfOptions")
            .then(() => {
              setIfeoData((prev) => {
                if (!prev) {
                  return prev;
                }

                const newData = new Map(prev);
                newData.set(normalizedProcessName, {
                  Path: path,
                  CpuPriorityClass: null,
                  IoPriority: null,
                  PagePriority: null,
                });

                return newData;
              });

              setNewProcessName("");
            })
            .catch((error: unknown) => {
              alert(error);
            });
        }}
      >
        +
      </Button>

      <TextInput
        value={newProcessName}
        placeholder="Enter process name"
        onChange={(event) => {
          setNewProcessName(event.currentTarget.value);
        }}
      />
    </Group>
  );
}
