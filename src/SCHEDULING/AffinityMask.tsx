import { Button, Chip, Group } from "@mantine/core";
import { useState } from "react";
import { REGISTRY_DATA_TYPES } from "../constants";

export default function AffinityMaskField({
  cpus,
  path,
  name,
  value,
}: {
  cpus: number;
  path: string;
  name: string;
  value: number | null;
}) {
  const [activeCpus, setActiveCpus] = useState<string[]>(
    value !== null
      ? Array.from({ length: cpus }, (_, index) =>
          value & (1 << index) ? index.toString() : null
        ).filter((index) => index !== null)
      : []
  );

  return (
    <div>
      <h2>{name}</h2>
      <Chip.Group
        multiple
        value={activeCpus}
        onChange={(value) => {
          if (value.length === 0) {
            window.pywebview.api
              .deleteRegistryValue(path, name)
              .then(() => {
                setActiveCpus(value.sort((a, b) => parseInt(a) - parseInt(b)));
              })
              .catch((error: unknown) => {
                alert(error);
              });
          } else {
            const binaryString = Array.from({ length: cpus }, (_, index) =>
              value.includes(index.toString()) ? "1" : "0"
            )
              .reverse()
              .join("");

            window.pywebview.api
              .writeRegistryValue(
                path,
                name,
                REGISTRY_DATA_TYPES.REG_BINARY,
                binaryString
              )
              .then(() => {
                setActiveCpus(value.sort((a, b) => parseInt(a) - parseInt(b)));
              })
              .catch((error: unknown) => {
                alert(error);
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

      <Group gap={"xs"}>
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
                path,
                name,
                REGISTRY_DATA_TYPES.REG_BINARY,
                binaryString
              )
              .then(() => {
                setActiveCpus(allCpus);
              })
              .catch((error: unknown) => {
                alert(error);
              });
          }}
        >
          All
        </Button>

        <Button
          variant="default"
          onClick={() => {
            window.pywebview.api
              .deleteRegistryValue(path, name)
              .then(() => {
                setActiveCpus([]);
              })
              .catch((error: unknown) => {
                alert(error);
              });
          }}
        >
          None
        </Button>
      </Group>
    </div>
  );
}
