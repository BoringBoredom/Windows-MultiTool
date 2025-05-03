import { ActionIcon, Group, Table } from "@mantine/core";
import { IconMinus } from "@tabler/icons-react";
import { COMPAT_PATH, type CompatibilityOptionsData } from ".";
import AddPath from "./AddPath";
import s from "./index.module.css";
import Options from "./Options";

export default function TableComponent({
  compatibilityOptionsData,
  setCompatibilityOptionsData,
  hiveStr,
}: {
  compatibilityOptionsData: CompatibilityOptionsData;
  setCompatibilityOptionsData: React.Dispatch<
    React.SetStateAction<CompatibilityOptionsData | undefined>
  >;
  hiveStr: "HKLM" | "HKCU";
}) {
  return (
    <Table.Tbody className={s.centerCheckbox}>
      <Table.Tr>
        <Table.Td colSpan={11} className={s.title}>
          {hiveStr === "HKLM" ? "All Users" : "Current User"}
        </Table.Td>
      </Table.Tr>

      {[...compatibilityOptionsData[hiveStr].entries()]
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([name, compatibilityOptions]) => (
          <Table.Tr key={name}>
            <Table.Td>
              <Group>
                <ActionIcon
                  size="xs"
                  variant="filled"
                  color="red"
                  onClick={() => {
                    window.pywebview.api
                      .deleteRegistryValue(hiveStr, COMPAT_PATH, name)
                      .then(() => {
                        setCompatibilityOptionsData((prev) => {
                          if (!prev) {
                            return prev;
                          }

                          const newData = { ...prev };
                          newData[hiveStr] = new Map(prev[hiveStr]);
                          newData[hiveStr].delete(name);

                          return newData;
                        });
                      })
                      .catch((error: unknown) => {
                        alert(
                          error instanceof Error ? error.toString() : error
                        );
                      });
                  }}
                >
                  <IconMinus />
                </ActionIcon>
                {name}
              </Group>
            </Table.Td>

            <Options
              name={name}
              compatibilityOptions={compatibilityOptions}
              hiveStr={hiveStr}
            />
          </Table.Tr>
        ))}
      <Table.Tr>
        <Table.Td>
          <AddPath
            hiveStr={hiveStr}
            compatibilityOptionsData={compatibilityOptionsData}
            setCompatibilityOptionsData={setCompatibilityOptionsData}
          />
        </Table.Td>
      </Table.Tr>
    </Table.Tbody>
  );
}
