import { Group, Table } from "@mantine/core";
import { useEffect, useState } from "react";
import s from "./index.module.css";

const DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY = {
  [-1]: "Other",
  [0]: "HD-15 (VGA)",
  [1]: "S-Video",
  [2]: "Composite Video",
  [3]: "Component Video",
  [4]: "DVI",
  [5]: "HDMI",
  [6]: "LVDS",
  [8]: "D-Terminal",
  [9]: "SDI",
  [10]: "DisplayPort External",
  [11]: "DisplayPort Embedded",
  [12]: "UDI External",
  [13]: "UDI Embedded",
  [14]: "SDTV Dongle",
  [15]: "Miracast",
  [16]: "Indirect Wired",
  [17]: "Indirect Virtual",
  [18]: "DisplayPort USB Tunnel",
  [0x80000000]: "Internal",
  [0xffffffff]: "Force UInt32",
} as const;

const DISPLAYCONFIG_ROTATION = {
  [1]: "0 °",
  [2]: "90 °",
  [3]: "180 °",
  [4]: "270 °",
  [0xffffffff]: "Force UInt32",
} as const;

const DISPLAYCONFIG_SCALING = {
  [1]: "Identity",
  [2]: "Centered",
  [3]: "Stretched",
  [4]: "AspectRatioCenteredMax",
  [5]: "Custom",
  [128]: "Preferred",
  [0xffffffff]: "Force UInt32",
} as const;

const DISPLAYCONFIG_PIXELFORMAT = {
  [1]: "8 BPP",
  [2]: "16 BPP",
  [3]: "24 BPP",
  [4]: "32 BPP",
  [5]: "NONGDI",
  [0xffffffff]: "Force UInt32",
} as const;

export interface DisplayInfo {
  displays: {
    monitorFriendlyDeviceName: string;
    monitorDevicePath: string;
    adapterDevicePath: string;
    outputTechnology: number;
    rotation: number;
    refreshRate: number;
    horizontalFrequency: number;
    resolution: string;
    pixelRate: number;
    scaling: number;
    pixelFormat: number;
    mpo: {
      MaxPlanes: number;
      MaxRGBPlanes: number;
      MaxYUVPlanes: number;
      MaxStretchFactor: number;
      MaxShrinkFactor: number;
      caps: {
        Rotation: number;
        RotationWithoutIndependentFlip: number;
        VerticalFlip: number;
        HorizontalFlip: number;
        StretchRGB: number;
        StretchYUV: number;
        BilinearFilter: number;
        HighFilter: number;
        Shared: number;
        Immediate: number;
        Plane0ForVirtualModeOnly: number;
        Version3DDISupport: number;
      };
    };
  }[];
}

export default function DISPLAY_INFO() {
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>();

  useEffect(() => {
    window.pywebview.api
      .getDisplayInfo()
      .then((data) => {
        setDisplayInfo(data);
      })
      .catch((error: unknown) => {
        alert(error);
      });
  }, []);

  if (!displayInfo) {
    return;
  }

  return (
    <Table withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th></Table.Th>
          {displayInfo.displays.map((display) => (
            <Table.Th key={display.monitorDevicePath}>
              {display.monitorFriendlyDeviceName}
              <div className={s.finePrint}>{display.monitorDevicePath}</div>
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Output Technology</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {
                DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY[
                  display.outputTechnology as keyof typeof DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY
                ]
              }
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Rotation</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {
                DISPLAYCONFIG_ROTATION[
                  display.rotation as keyof typeof DISPLAYCONFIG_ROTATION
                ]
              }
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Refresh Rate</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {display.refreshRate.toString() + " Hz"}
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Horizontal Frequency</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {display.horizontalFrequency.toString() + " Hz"}
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Resolution</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {display.resolution}
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Pixel Rate</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {display.pixelRate.toString() + " Hz"}
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Scaling</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {
                DISPLAYCONFIG_SCALING[
                  display.scaling as keyof typeof DISPLAYCONFIG_SCALING
                ]
              }
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>Pixel Format</Table.Td>
          {displayInfo.displays.map((display) => (
            <Table.Td key={display.monitorDevicePath}>
              {
                DISPLAYCONFIG_PIXELFORMAT[
                  display.pixelFormat as keyof typeof DISPLAYCONFIG_PIXELFORMAT
                ]
              }
            </Table.Td>
          ))}
        </Table.Tr>

        <Table.Tr>
          <Table.Td>MPO Capabilities</Table.Td>
          {displayInfo.displays.map((display) => {
            const { mpo } = display;

            return (
              <Table.Td key={display.monitorDevicePath}>
                {Object.entries(mpo).map(([key, value]) => {
                  if (key !== "caps") {
                    return (
                      <Group key={key} justify="space-between">
                        <div>{key}</div>
                        <div>{value as number}</div>
                      </Group>
                    );
                  }
                })}

                <br />

                {Object.entries(mpo.caps).map(([key, value]) => (
                  <Group key={key} justify="space-between">
                    <div>{key}</div>
                    <div style={{ color: value ? "green" : "red" }}>
                      {value ? "✓" : "✗"}
                    </div>
                  </Group>
                ))}
              </Table.Td>
            );
          })}
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
