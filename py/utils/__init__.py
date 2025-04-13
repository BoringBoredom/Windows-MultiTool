import winreg


def write_registry_value(path: str, name: str, type: int, value: int | str):
    with winreg.CreateKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        path,
        0,
        winreg.KEY_WRITE | winreg.KEY_WOW64_64KEY,
    ) as key:
        if type == winreg.REG_BINARY and isinstance(value, str):
            winreg.SetValueEx(key, name, 0, type, int(value, 2).to_bytes(8, "little"))
        elif type == winreg.REG_DWORD and isinstance(value, int):
            winreg.SetValueEx(key, name, 0, type, value)


def delete_registry_value(path: str, value: str):
    with winreg.OpenKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        path,
        0,
        winreg.KEY_WRITE | winreg.KEY_WOW64_64KEY,
    ) as key:
        winreg.DeleteValue(key, value)


def delete_registry_key(path: str, key: str):
    with winreg.OpenKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        path,
        0,
        winreg.KEY_WRITE | winreg.KEY_WOW64_64KEY,
    ) as base_key:
        winreg.DeleteKeyEx(base_key, key)


def create_registry_key(path: str):
    with winreg.CreateKeyEx(
        winreg.HKEY_LOCAL_MACHINE, path, 0, winreg.KEY_READ | winreg.KEY_WOW64_64KEY
    ):
        pass
