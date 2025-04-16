import { Divider, Tooltip } from "@mantine/core";
import { Fragment } from "react";
import type { Setting } from ".";

export default function PossibleValues({ setting }: { setting: Setting }) {
  const { options } = setting;

  if (options) {
    return options.map((option, index) => (
      <Fragment key={option.index}>
        <Tooltip label={option.description}>
          <div>{option.name}</div>
        </Tooltip>
        {index < options.length - 1 && <Divider />}
      </Fragment>
    ));
  } else if (setting.range) {
    return (
      <>
        <div>Min: {setting.range.min}</div>
        <Divider />
        <div>Max: {setting.range.max}</div>
        <Divider />
        <div>Step: {setting.range.increment}</div>
        <Divider />
        <div>Unit: {setting.range.unit}</div>
      </>
    );
  }
}
