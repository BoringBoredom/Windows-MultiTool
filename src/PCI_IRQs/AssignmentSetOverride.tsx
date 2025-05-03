import { Button, Chip, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { AFFINITY_PATH, type SystemInfo } from ".";
import { REGISTRY_DATA_TYPES } from "../shared";

export default function AssignmentSetOverrideField({
  device,
  cpus,
}: {
  device: SystemInfo["devices"][number];
  cpus: number;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeCpus, setActiveCpus] = useState<string[]>(
    device.AssignmentSetOverride !== null
      ? Array.from({ length: cpus }, (_, index) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          device.AssignmentSetOverride! & (1 << index) ? index.toString() : null
        ).filter((index) => index !== null)
      : []
  );

  return (
    <>
      <Modal opened={opened} onClose={close}>
        <Chip.Group
          multiple
          value={activeCpus}
          onChange={(value) => {
            if (value.length === 0) {
              window.pywebview.api
                .deleteRegistryValue(
                  "HKLM",
                  device.Path + AFFINITY_PATH,
                  "AssignmentSetOverride"
                )
                .then(() => {
                  setActiveCpus(
                    value.sort((a, b) => parseInt(a) - parseInt(b))
                  );
                })
                .catch((error: unknown) => {
                  alert(error instanceof Error ? error.toString() : error);
                });
            } else {
              const binaryString = Array.from({ length: cpus }, (_, index) =>
                value.includes(index.toString()) ? "1" : "0"
              )
                .reverse()
                .join("");

              window.pywebview.api
                .writeRegistryValue(
                  "HKLM",
                  device.Path + AFFINITY_PATH,
                  "AssignmentSetOverride",
                  REGISTRY_DATA_TYPES.REG_BINARY,
                  binaryString
                )
                .then(() => {
                  setActiveCpus(
                    value.sort((a, b) => parseInt(a) - parseInt(b))
                  );
                })
                .catch((error: unknown) => {
                  alert(error instanceof Error ? error.toString() : error);
                });
            }
          }}
        >
          <Group gap="xs" wrap="wrap">
            {Array.from({ length: cpus }, (_, index) => (
              <Chip key={index} value={index.toString()}>
                {index}
              </Chip>
            ))}
          </Group>
        </Chip.Group>

        <br />

        <Group gap="xs">
          <Button
            variant="default"
            onClick={() => {
              const allCpus = Array.from({ length: cpus }, (_, index) =>
                index.toString()
              );

              const binaryString = Array.from({ length: cpus }, () => "1")
                .reverse()
                .join("");

              window.pywebview.api
                .writeRegistryValue(
                  "HKLM",
                  device.Path + AFFINITY_PATH,
                  "AssignmentSetOverride",
                  REGISTRY_DATA_TYPES.REG_BINARY,
                  binaryString
                )
                .then(() => {
                  setActiveCpus(allCpus);
                })
                .catch((error: unknown) => {
                  alert(error instanceof Error ? error.toString() : error);
                });
            }}
          >
            All
          </Button>

          <Button
            variant="default"
            onClick={() => {
              window.pywebview.api
                .deleteRegistryValue(
                  "HKLM",
                  device.Path + AFFINITY_PATH,
                  "AssignmentSetOverride"
                )
                .then(() => {
                  setActiveCpus([]);
                })
                .catch((error: unknown) => {
                  alert(error instanceof Error ? error.toString() : error);
                });
            }}
          >
            None
          </Button>
        </Group>
      </Modal>

      <Button size="xs" variant="default" fullWidth onClick={open}>
        {activeCpus.join(", ")}
      </Button>
    </>
  );
}
