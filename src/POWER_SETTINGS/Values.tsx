import type { Setting } from ".";
import NumberOption from "./NumberOption";
import SelectOption from "./SelectOption";

export default function Values({
  setting,
  schemeGuid,
  subgroupGuid,
}: {
  setting: Setting;
  schemeGuid: string;
  subgroupGuid: string;
}) {
  if (setting.options) {
    return (
      <>
        <SelectOption
          setting={setting}
          type="ac"
          schemeGuid={schemeGuid}
          subgroupGuid={subgroupGuid}
        />
        <SelectOption
          setting={setting}
          type="dc"
          schemeGuid={schemeGuid}
          subgroupGuid={subgroupGuid}
        />
      </>
    );
  }

  return (
    <>
      <NumberOption
        setting={setting}
        type="ac"
        schemeGuid={schemeGuid}
        subgroupGuid={subgroupGuid}
      />
      <NumberOption
        setting={setting}
        type="dc"
        schemeGuid={schemeGuid}
        subgroupGuid={subgroupGuid}
      />
    </>
  );
}
