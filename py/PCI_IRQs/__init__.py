from ctypes import (
    POINTER,
    GetLastError,
    Structure,
    WinError,
    byref,
    c_byte,
    c_long,
    c_ulong,
    c_wchar_p,
    cast,
    sizeof,
    windll,
)
from ctypes.wintypes import BOOL, DWORD, HANDLE, HWND
from os import cpu_count
from typing import Final, List, TypedDict
from winreg import (
    HKEY_LOCAL_MACHINE,
    KEY_READ,
    KEY_WOW64_64KEY,
    EnumKey,
    OpenKeyEx,
    QueryInfoKey,
    QueryValueEx,
)

from py.utils import GUID


class DEVPROPKEY(Structure):
    _fields_ = [
        ("fmtid", GUID),
        ("pid", c_ulong),
    ]


class SP_DEVINFO_DATA(Structure):
    _fields_ = [
        ("cbSize", c_ulong),
        ("ClassGuid", GUID),
        ("DevInst", c_ulong),
        ("Reserved", POINTER(c_ulong)),
    ]


class Device(TypedDict):
    DeviceId: str
    Path: str
    DeviceName: str
    DevicePriority: int | None
    DevicePolicy: int | None
    AssignmentSetOverride: int | None
    MessageNumberLimit: int | None
    MSISupported: int | None
    InterruptSupport: int | None
    MaximumMessageNumberLimit: int | None


BASE_PATH: Final = r"SYSTEM\CurrentControlSet\Enum\PCI"

CONFIGFLAG_DISABLED: Final = 0x1
CONFIGFLAG_REMOVED: Final = 0x2

DIGCF_ALLCLASSES: Final = 0x4
DIGCF_DEVICEINTERFACE: Final = 0x10

ERROR_INSUFFICIENT_BUFFER: Final = 122
ERROR_NO_MORE_ITEMS: Final = 259
ERROR_ELEMENT_NOT_FOUND: Final = 1168

setupapi = windll.setupapi

SetupDiGetClassDevsW = setupapi.SetupDiGetClassDevsW
SetupDiGetClassDevsW.argtypes = [POINTER(GUID), c_wchar_p, HWND, DWORD]
SetupDiGetClassDevsW.restype = HANDLE

SetupDiEnumDeviceInfo = setupapi.SetupDiEnumDeviceInfo
SetupDiEnumDeviceInfo.argtypes = [HANDLE, DWORD, POINTER(SP_DEVINFO_DATA)]
SetupDiEnumDeviceInfo.restype = BOOL

SetupDiGetDevicePropertyW = setupapi.SetupDiGetDevicePropertyW
SetupDiGetDevicePropertyW.argtypes = [
    HANDLE,
    POINTER(SP_DEVINFO_DATA),
    POINTER(DEVPROPKEY),
    POINTER(c_ulong),
    POINTER(c_byte),
    DWORD,
    POINTER(DWORD),
    DWORD,
]
SetupDiGetDevicePropertyW.restype = BOOL

SetupDiDestroyDeviceInfoList = setupapi.SetupDiDestroyDeviceInfoList
SetupDiDestroyDeviceInfoList.argtypes = [HANDLE]
SetupDiDestroyDeviceInfoList.restype = BOOL


def get_device_property(
    dev_info_handle: HANDLE,
    dev_info_data: SP_DEVINFO_DATA,
    DEVPKEY: DEVPROPKEY,
):
    property_type = c_ulong()
    required_size = c_ulong()

    result = SetupDiGetDevicePropertyW(
        dev_info_handle,
        byref(dev_info_data),
        byref(DEVPKEY),
        byref(property_type),
        None,
        0,
        byref(required_size),
        0,
    )
    last_error = GetLastError()
    if last_error == ERROR_ELEMENT_NOT_FOUND:
        return None
    if last_error != ERROR_INSUFFICIENT_BUFFER:
        raise WinError()

    property_buffer = (c_byte * required_size.value)()
    result = SetupDiGetDevicePropertyW(
        dev_info_handle,
        byref(dev_info_data),
        byref(DEVPKEY),
        byref(property_type),
        property_buffer,
        required_size.value,
        None,
        0,
    )
    if result == 0:
        raise WinError()
    else:
        return cast(property_buffer, POINTER(c_long)).contents.value


def get_additional_info(instance_id: str):
    extra_info: dict[str, int | None] = {
        "InterruptSupport": None,
        "MaximumMessageNumberLimit": None,
    }

    device_instance_id = c_wchar_p(instance_id)

    dev_info_handle = SetupDiGetClassDevsW(
        None,
        device_instance_id,
        None,
        DIGCF_ALLCLASSES | DIGCF_DEVICEINTERFACE,
    )
    if dev_info_handle == -1:
        raise WinError()

    dev_info_data = SP_DEVINFO_DATA()
    dev_info_data.cbSize = sizeof(SP_DEVINFO_DATA)

    result = SetupDiEnumDeviceInfo(dev_info_handle, 0, byref(dev_info_data))
    if result == 0:
        if GetLastError() == ERROR_NO_MORE_ITEMS:
            SetupDiDestroyDeviceInfoList(dev_info_handle)

            return extra_info

        raise WinError()

    DEVPKEY_PciDevice_InterruptSupport = DEVPROPKEY(
        GUID("3ab22e31-8264-4b4e-9af5-a8d2d8e33e62"), 14
    )
    DEVPKEY_PciDevice_InterruptMessageMaximum = DEVPROPKEY(
        GUID("3ab22e31-8264-4b4e-9af5-a8d2d8e33e62"), 15
    )

    extra_info = {
        "InterruptSupport": get_device_property(
            dev_info_handle,
            dev_info_data,
            DEVPKEY_PciDevice_InterruptSupport,
        ),
        "MaximumMessageNumberLimit": get_device_property(
            dev_info_handle, dev_info_data, DEVPKEY_PciDevice_InterruptMessageMaximum
        ),
    }

    SetupDiDestroyDeviceInfoList(dev_info_handle)

    return extra_info


def get_system_info():
    devices: List[Device] = []

    with OpenKeyEx(
        HKEY_LOCAL_MACHINE, BASE_PATH, 0, KEY_READ | KEY_WOW64_64KEY
    ) as base_key:
        for i in range(QueryInfoKey(base_key)[0]):
            partial_device_id = EnumKey(base_key, i)
            partial_device_path = f"{BASE_PATH}\\{partial_device_id}"

            with OpenKeyEx(
                HKEY_LOCAL_MACHINE, partial_device_path, 0, KEY_READ | KEY_WOW64_64KEY
            ) as partial_device_key:
                if QueryInfoKey(partial_device_key)[0] > 0:
                    second_device_id = EnumKey(partial_device_key, 0)
                    device_path = f"{partial_device_path}\\{second_device_id}"
                    instance_id = f"PCI\\{partial_device_id}\\{second_device_id}"

                    with OpenKeyEx(
                        HKEY_LOCAL_MACHINE, device_path, 0, KEY_READ | KEY_WOW64_64KEY
                    ) as device_key:
                        config_flags = QueryValueEx(device_key, "ConfigFlags")[0]
                        device_desc = QueryValueEx(device_key, "DeviceDesc")[0]

                    if (config_flags & (CONFIGFLAG_DISABLED | CONFIGFLAG_REMOVED)) == 0:
                        try:
                            with OpenKeyEx(
                                HKEY_LOCAL_MACHINE,
                                device_path
                                + r"\Device Parameters\Interrupt Management\Affinity Policy",
                                0,
                                KEY_READ | KEY_WOW64_64KEY,
                            ) as affinity_key:
                                try:
                                    device_priority = QueryValueEx(
                                        affinity_key, "DevicePriority"
                                    )[0]
                                except FileNotFoundError:
                                    device_priority = None

                                try:
                                    device_policy = QueryValueEx(
                                        affinity_key, "DevicePolicy"
                                    )[0]
                                except FileNotFoundError:
                                    device_policy = None

                                try:
                                    assignment_set_override = int.from_bytes(
                                        QueryValueEx(
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
                            with OpenKeyEx(
                                HKEY_LOCAL_MACHINE,
                                device_path
                                + r"\Device Parameters\Interrupt Management\MessageSignaledInterruptProperties",
                                0,
                                KEY_READ | KEY_WOW64_64KEY,
                            ) as msi_key:
                                try:
                                    message_number_limit = QueryValueEx(
                                        msi_key, "MessageNumberLimit"
                                    )[0]
                                except FileNotFoundError:
                                    message_number_limit = None

                                try:
                                    msi_supported = QueryValueEx(
                                        msi_key, "MSISupported"
                                    )[0]
                                except FileNotFoundError:
                                    msi_supported = None
                        except FileNotFoundError:
                            message_number_limit = None
                            msi_supported = None

                        extra_info = get_additional_info(instance_id)

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
                                "InterruptSupport": extra_info.get("InterruptSupport"),
                                "MaximumMessageNumberLimit": extra_info.get(
                                    "MaximumMessageNumberLimit"
                                ),
                            }
                        )

    return {
        "cpu": {"cpus": cpu_count()},
        "devices": devices,
    }
