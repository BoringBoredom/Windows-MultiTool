import { Button, Group, Table } from "@mantine/core";
import { useEffect, useState } from "react";
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

export default function IFEO() {
  const [ifeoData, setIfeoData] = useState<IfeoData>();

  useEffect(() => {
    window.pywebview.api
      .getIfeoData()
      .then((data) => {
        setIfeoData(new Map(Object.entries(data)));
      })
      .catch((error: unknown) => {
        alert(error);
      });
  }, []);

  if (!ifeoData) {
    return;
  }

  return (
    <Table withColumnBorders>
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
                  <Button
                    size="xs"
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
                          alert(error);
                        });
                    }}
                  >
                    -
                  </Button>
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
  );
}
