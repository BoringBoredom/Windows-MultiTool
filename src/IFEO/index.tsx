import { ActionIcon, Group, Menu, Table } from "@mantine/core";
import { IconChevronDown, IconMinus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import s from "../App.module.css";
import { formatRegValue } from "../shared";
import AddNewProcess from "./AddProcess";
import CpuPriorityField from "./CpuPriority";
import IoPriorityField from "./IoPriority";
import PagePriorityField from "./PagePriority";

export interface IfeoDataValue {
  Path: string;
  CpuPriorityClass: number | null;
  IoPriority: number | null;
  PagePriority: number | null;
}

export type IfeoData = Map<string, IfeoDataValue>;

export const IFEO_PATH =
  "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options";

function getExportData(ifeoData: IfeoData, isReg: boolean) {
  let content = "";

  if (isReg) {
    content += "Windows Registry Editor Version 5.00\n\n";

    for (const [name, data] of ifeoData) {
      content +=
        `[HKEY_LOCAL_MACHINE\\${IFEO_PATH}\\${name}\\PerfOptions]\n` +
        formatRegValue("CpuPriorityClass", data.CpuPriorityClass) +
        formatRegValue("IoPriority", data.IoPriority) +
        formatRegValue("PagePriority", data.PagePriority) +
        "\n";
    }
  } else {
    content +=
      "setlocal\n\n" + `set "IFEO_BASE=HKEY_LOCAL_MACHINE\\${IFEO_PATH}"\n\n`;

    for (const [name, data] of ifeoData) {
      content += `set "APP_KEY=%IFEO_BASE%\\${name}\\PerfOptions"\n`;

      const baseAdd = `reg add "%APP_KEY%"`;
      const baseDelete = `reg delete "%APP_KEY%"`;

      if (data.CpuPriorityClass !== null) {
        content += `${baseAdd} /v CpuPriorityClass /t REG_DWORD /d ${data.CpuPriorityClass.toString()} /f\n`;
      } else {
        content += `${baseDelete} /v CpuPriorityClass /f\n`;
      }

      if (data.IoPriority !== null) {
        content += `${baseAdd} /v IoPriority /t REG_DWORD /d ${data.IoPriority.toString()} /f\n`;
      } else {
        content += `${baseDelete} /v IoPriority /f\n`;
      }

      if (data.PagePriority !== null) {
        content += `${baseAdd} /v PagePriority /t REG_DWORD /d ${data.PagePriority.toString()} /f\n`;
      } else {
        content += `${baseDelete} /v PagePriority /f\n`;
      }

      content += "\n";
    }

    content += "endlocal";
  }

  return content;
}

export default function IFEO() {
  const [ifeoData, setIfeoData] = useState<IfeoData>();

  useEffect(() => {
    window.pywebview.api
      .getIfeoData()
      .then((data) => {
        setIfeoData(new Map(Object.entries(data)));
      })
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.toString() : error);
      });
  }, []);

  if (!ifeoData) {
    return;
  }

  return (
    <>
      <div className={s.menu}>
        <Menu>
          <Menu.Target>
            <ActionIcon size="xs" variant="default">
              <IconChevronDown />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>EXPORT</Menu.Label>
            <Menu.Item
              onClick={() => {
                if (ifeoData.size !== 0) {
                  window.pywebview.api
                    .saveFile(
                      "ifeo.reg",
                      ["Registry File (*.reg)"],
                      getExportData(ifeoData, true)
                    )
                    .catch((error: unknown) => {
                      alert(error instanceof Error ? error.toString() : error);
                    });
                }
              }}
            >
              .reg
            </Menu.Item>

            <Menu.Item
              onClick={() => {
                if (ifeoData.size !== 0) {
                  window.pywebview.api
                    .saveFile(
                      "ifeo.bat",
                      ["Batch File (*.bat)"],
                      getExportData(ifeoData, false)
                    )
                    .catch((error: unknown) => {
                      alert(error instanceof Error ? error.toString() : error);
                    });
                }
              }}
            >
              .bat
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <Table withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Process</Table.Th>
            <Table.Th>CPU Priority Class</Table.Th>
            <Table.Th>IO Priority</Table.Th>
            <Table.Th>Memory Priority</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {[...ifeoData.entries()]
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([process_name, data]) => (
              <Table.Tr key={process_name}>
                <Table.Td>
                  <Group>
                    <ActionIcon
                      variant="filled"
                      color="red"
                      onClick={() => {
                        window.pywebview.api
                          .deleteRegistryKey(data.Path, "PerfOptions")
                          .then(() => {
                            setIfeoData((prev) => {
                              if (!prev) {
                                return prev;
                              }

                              const newData = new Map(prev);
                              newData.delete(process_name);

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
                    {process_name}
                  </Group>
                </Table.Td>

                <Table.Td>
                  <CpuPriorityField data={data} />
                </Table.Td>

                <Table.Td>
                  <IoPriorityField data={data} />
                </Table.Td>

                <Table.Td>
                  <PagePriorityField data={data} />
                </Table.Td>
              </Table.Tr>
            ))}
          <Table.Tr>
            <Table.Td>
              <AddNewProcess ifeoData={ifeoData} setIfeoData={setIfeoData} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </>
  );
}
