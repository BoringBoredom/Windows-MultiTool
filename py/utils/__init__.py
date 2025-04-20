from ctypes import Structure, c_ubyte, c_ulong, c_ushort
from uuid import UUID
from winreg import (
    HKEY_LOCAL_MACHINE,
    KEY_READ,
    KEY_WOW64_64KEY,
    KEY_WRITE,
    REG_BINARY,
    REG_DWORD,
    CreateKeyEx,
    DeleteKeyEx,
    DeleteValue,
    OpenKeyEx,
    SetValueEx,
)


class GUID(Structure):
    _fields_ = [
        ("Data1", c_ulong),
        ("Data2", c_ushort),
        ("Data3", c_ushort),
        ("Data4", c_ubyte * 8),
    ]

    def __init__(self, uuid_string: str | None = None):
        if uuid_string:
            uuid_obj = UUID(uuid_string)
            self.Data1 = uuid_obj.time_low
            self.Data2 = uuid_obj.time_mid
            self.Data3 = uuid_obj.time_hi_version
            for i in range(8):
                self.Data4[i] = uuid_obj.bytes[8 + i]
        super().__init__()

    def __str__(self):
        return "{:08X}-{:04X}-{:04X}-{:02X}{:02X}-{:02X}{:02X}{:02X}{:02X}{:02X}{:02X}".format(
            self.Data1,
            self.Data2,
            self.Data3,
            *self.Data4,
        )


def write_registry_value(path: str, name: str, type: int, value: int | str):
    with CreateKeyEx(HKEY_LOCAL_MACHINE, path, 0, KEY_WRITE | KEY_WOW64_64KEY) as key:
        if type == REG_BINARY and isinstance(value, str):
            SetValueEx(key, name, 0, type, int(value, 2).to_bytes(8, "little"))
        elif type == REG_DWORD and isinstance(value, int):
            SetValueEx(key, name, 0, type, value)


def delete_registry_value(path: str, value: str):
    with OpenKeyEx(HKEY_LOCAL_MACHINE, path, 0, KEY_WRITE | KEY_WOW64_64KEY) as key:
        DeleteValue(key, value)


def delete_registry_key(path: str, key: str):
    with OpenKeyEx(
        HKEY_LOCAL_MACHINE, path, 0, KEY_WRITE | KEY_WOW64_64KEY
    ) as base_key:
        DeleteKeyEx(base_key, key)


def create_registry_key(path: str):
    with CreateKeyEx(HKEY_LOCAL_MACHINE, path, 0, KEY_READ | KEY_WOW64_64KEY):
        pass
