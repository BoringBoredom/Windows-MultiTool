import { Table, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import s from "./index.module.css";
import PossibleValues from "./PossibleValues";
import Values from "./Values";

export interface PowerSettings {
  activeSchemeGuid: string;
  powerSchemes: PowerSchemes;
}

type PowerSchemes = {
  guid: string;
  name: string;
  settings: Setting[];
}[];

interface Subgroup {
  guid: string;
  name: string | null;
}

interface Option {
  index: number;
  name: string;
  description: string;
}

interface Range {
  min: number;
  max: number;
  increment: number;
  unit: string;
}

export interface Setting {
  guid: string;
  name: string;
  description: string;
  options: Option[] | null;
  range: Range | null;
  subgroup: Subgroup;
  ac: number;
  dc: number;
}

export default function POWER_SETTINGS() {
  const [powerSettings, setPowerSettings] = useState<PowerSettings>();

  useEffect(() => {
    window.pywebview.api
      .getPowerSettings()
      .then((data) => {
        setPowerSettings(data);
      })
      .catch((error: unknown) => {
        alert(error);
      });
  }, []);

  if (!powerSettings) {
    return;
  }

  const { powerSchemes, activeSchemeGuid } = powerSettings;

  const activeSchemeIndex = powerSchemes.findIndex(
    (scheme) => scheme.guid === activeSchemeGuid
  );

  return (
    <Tabs variant="pills" defaultValue={activeSchemeIndex.toString()}>
      <Tabs.List className={s.powerPlanSelection}>
        {powerSchemes.map((powerScheme, index) => (
          <Tabs.Tab value={index.toString()} key={powerScheme.guid}>
            {powerScheme.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Table stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Subgroup</Table.Th>
            <Table.Th>Setting</Table.Th>
            <Table.Th className={s.valuesWidth}>Value</Table.Th>
            <Table.Th>Possible Values</Table.Th>
            <Table.Th>Description</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {powerSchemes[activeSchemeIndex].settings.map(
            (setting, settingIndex) => (
              <Table.Tr key={settingIndex.toString() + setting.guid}>
                <Table.Td>{setting.subgroup.name}</Table.Td>

                <Table.Td>{setting.name}</Table.Td>

                <Table.Td>
                  {powerSchemes.map((powerScheme, powerSchemeIndex) => (
                    <Tabs.Panel
                      value={powerSchemeIndex.toString()}
                      key={powerScheme.guid}
                    >
                      <Values
                        setting={powerScheme.settings[settingIndex]}
                        schemeGuid={powerScheme.guid}
                        subgroupGuid={setting.subgroup.guid}
                      />
                    </Tabs.Panel>
                  ))}
                </Table.Td>

                <Table.Td>
                  <PossibleValues setting={setting} />
                </Table.Td>

                <Table.Td>{setting.description}</Table.Td>
              </Table.Tr>
            )
          )}
        </Table.Tbody>
      </Table>
    </Tabs>
  );
}
