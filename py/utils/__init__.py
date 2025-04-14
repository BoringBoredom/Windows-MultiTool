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
