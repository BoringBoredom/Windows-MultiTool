import { ActionIcon, Center, Menu, Stack } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import s from "../App.module.css";
import { formatBitMask } from "../shared";
import AffinityMaskField from "./AffinityMask";

export const KERNEL_PATH =
  "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\kernel";

export interface SchedulingInfo {
  ReservedCpuSets: number | null;
  SmallProcessorMask: number | null;
  cpu: { cpus: number };
}

function getExportData(schedulingInfo: SchedulingInfo, isReg: boolean) {
  const { ReservedCpuSets, SmallProcessorMask } = schedulingInfo;

  let content = "";

  if (isReg) {
    content =
      "Windows Registry Editor Version 5.00\n\n" +
      `[HKEY_LOCAL_MACHINE\\${KERNEL_PATH}]\n` +
      `"ReservedCpuSets"=${formatBitMask(ReservedCpuSets, true)}\n\n` +
      `[HKEY_LOCAL_MACHINE\\${KERNEL_PATH}\\KGroups\\00]\n` +
      `"SmallProcessorMask"=${formatBitMask(SmallProcessorMask, true)}`;
  } else {
    if (ReservedCpuSets !== null) {
      content += `reg add "HKEY_LOCAL_MACHINE\\${KERNEL_PATH}" /v ReservedCpuSets /t REG_BINARY /d ${formatBitMask(
        ReservedCpuSets,
        false
      )} /f\n`;
    } else {
      content += `reg delete "HKEY_LOCAL_MACHINE\\${KERNEL_PATH}" /v ReservedCpuSets /f\n`;
    }

    if (SmallProcessorMask !== null) {
      content += `reg add "HKEY_LOCAL_MACHINE\\${KERNEL_PATH}\\KGroups\\00" /v SmallProcessorMask /t REG_BINARY /d ${formatBitMask(
        SmallProcessorMask,
        false
      )} /f\n`;
    } else {
      content += `reg delete "HKEY_LOCAL_MACHINE\\${KERNEL_PATH}\\KGroups\\00" /v SmallProcessorMask /f\n`;
    }
  }

  return content;
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
                window.pywebview.api
                  .saveFile(
                    "scheduling.reg",
                    ["Registry File (*.reg)"],
                    getExportData(schedulingInfo, true)
                  )
                  .catch((error: unknown) => {
                    alert(error instanceof Error ? error.toString() : error);
                  });
              }}
            >
              .reg
            </Menu.Item>

            <Menu.Item
              onClick={() => {
                window.pywebview.api
                  .saveFile(
                    "scheduling.bat",
                    ["Batch File (*.bat)"],
                    getExportData(schedulingInfo, false)
                  )
                  .catch((error: unknown) => {
                    alert(error instanceof Error ? error.toString() : error);
                  });
              }}
            >
              .bat
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <Center h="100vh">
        <Stack gap="xl">
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
    </>
  );
}
