import { Center, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import AffinityMaskField from "./AffinityMask";

export const KERNEL_PATH =
  "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\kernel";

export interface SchedulingInfo {
  ReservedCpuSets: number | null;
  SmallProcessorMask: number | null;
  cpu: { cpus: number };
}

export default function SCHEDULING() {
  const [schedulingInfo, setSchedulingInfo] = useState<SchedulingInfo>();

  useEffect(() => {
    window.pywebview.api
      .getSchedulingInfo()
      .then((data) => {
        setSchedulingInfo(data);
      })
      .catch((error: unknown) => {
        alert(error instanceof Error ? error.toString() : error);
      });
  }, []);

  if (!schedulingInfo) {
    return;
  }

  return (
    <Center h="100vh">
      <Stack gap={"xl"}>
        <AffinityMaskField
          cpus={schedulingInfo.cpu.cpus}
          path={KERNEL_PATH}
          name="ReservedCpuSets"
          value={schedulingInfo.ReservedCpuSets}
        />

        <AffinityMaskField
          cpus={schedulingInfo.cpu.cpus}
          path={KERNEL_PATH + "\\KGroups\\00"}
          name="SmallProcessorMask"
          value={schedulingInfo.SmallProcessorMask}
        />
      </Stack>
    </Center>
  );
}
