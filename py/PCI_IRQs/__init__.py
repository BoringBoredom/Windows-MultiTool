import winreg
from os import cpu_count
from typing import Final, List, TypedDict

BASE_PATH: Final = r"SYSTEM\CurrentControlSet\Enum\PCI"


class Device(TypedDict):
    DeviceId: str
    Path: str
    DeviceName: str
    DevicePriority: int | None
    DevicePolicy: int | None
    AssignmentSetOverride: int | None
    MessageNumberLimit: int | None
    MSISupported: int | None


CONFIGFLAG_DISABLED = 0x1
CONFIGFLAG_REMOVED = 0x2


def get_system_info():
    devices: List[Device] = []

    with winreg.OpenKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        BASE_PATH,
        0,
        winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
    ) as base_key:
        for i in range(winreg.QueryInfoKey(base_key)[0]):
            partial_device_id = winreg.EnumKey(base_key, i)
            partial_device_path = f"{BASE_PATH}\\{partial_device_id}"

            with winreg.OpenKeyEx(
                winreg.HKEY_LOCAL_MACHINE,
                partial_device_path,
                0,
                winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
            ) as partial_device_key:
                if winreg.QueryInfoKey(partial_device_key)[0] > 0:
                    device_path = f"{partial_device_path}\\{winreg.EnumKey(partial_device_key, 0)}"

                    with winreg.OpenKeyEx(
                        winreg.HKEY_LOCAL_MACHINE,
                        device_path,
                        0,
                        winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
                    ) as device_key:
                        config_flags = winreg.QueryValueEx(device_key, "ConfigFlags")[0]
                        device_desc = winreg.QueryValueEx(device_key, "DeviceDesc")[0]

                    if (config_flags & (CONFIGFLAG_DISABLED | CONFIGFLAG_REMOVED)) == 0:
                        try:
                            with winreg.OpenKeyEx(
                                winreg.HKEY_LOCAL_MACHINE,
                                device_path
                                + r"\Device Parameters\Interrupt Management\Affinity Policy",
                                0,
                                winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
                            ) as affinity_key:
                                try:
                                    device_priority = winreg.QueryValueEx(
                                        affinity_key, "DevicePriority"
                                    )[0]
                                except FileNotFoundError:
                                    device_priority = None

                                try:
                                    device_policy = winreg.QueryValueEx(
                                        affinity_key, "DevicePolicy"
                                    )[0]
                                except FileNotFoundError:
                                    device_policy = None

                                try:
                                    assignment_set_override = int.from_bytes(
                                        winreg.QueryValueEx(
                                            affinity_key, "AssignmentSetOverride"
                                        )[0],
                                        "little",
                                    )
                                except FileNotFoundError:
                                    assignment_set_override = None
                        except FileNotFoundError:
                            device_priority = None
                            device_policy = None
                            assignment_set_override = None

                        try:
                            with winreg.OpenKeyEx(
                                winreg.HKEY_LOCAL_MACHINE,
                                device_path
                                + r"\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties",
                                0,
                                winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
                            ) as msi_key:
                                try:
                                    message_number_limit = winreg.QueryValueEx(
                                        msi_key, "MessageNumberLimit"
                                    )[0]
                                except FileNotFoundError:
                                    message_number_limit = None

                                try:
                                    msi_supported = winreg.QueryValueEx(
                                        msi_key, "MSISupported"
                                    )[0]
                                except FileNotFoundError:
                                    msi_supported = None
                        except FileNotFoundError:
                            message_number_limit = None
                            msi_supported = None

                        devices.append(
                            {
                                "DeviceId": partial_device_id,
                                "Path": device_path,
                                "DeviceName": device_desc.split(";")[1],
                                "DevicePriority": device_priority,
                                "DevicePolicy": device_policy,
                                "AssignmentSetOverride": assignment_set_override,
                                "MessageNumberLimit": message_number_limit,
                                "MSISupported": msi_supported,
                            }
                        )

    return {
        "cpu": {"cpus": cpu_count()},
        "devices": devices,
    }
