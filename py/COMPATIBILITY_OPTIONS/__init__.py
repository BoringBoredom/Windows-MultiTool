from typing import Final
from winreg import (
    HKEY_CURRENT_USER,
    HKEY_LOCAL_MACHINE,
    KEY_READ,
    KEY_WOW64_64KEY,
    REG_SZ,
    EnumValue,
    OpenKeyEx,
    QueryInfoKey,
)

CompatibilityOptions = list[str | None]
HiveData = dict[str, CompatibilityOptions]

HKLM_PATH: Final = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
HKCU_PATH: Final = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"

options_map: list[set[str]] = [
    {"~"},
    {"DISABLEDXMAXIMIZEDWINDOWEDMODE"},
    {"RUNASADMIN"},
    {"640X480"},
    {"PERPROCESSSYSTEMDPIFORCEOFF", "PERPROCESSSYSTEMDPIFORCEON"},
    {"HIGHDPIAWARE", "DPIUNAWARE", "GDIDPISCALING DPIUNAWARE"},
    {"256COLOR"},
    {"16BITCOLOR"},
    {"TRANSFORMLEGACYCOLORMANAGED"},
    {
        "WIN95",
        "WIN98",
        "WINXPSP2",
        "WINXPSP3",
        "VISTARTM",
        "VISTASP1",
        "VISTASP2",
        "WIN7RTM",
        "WIN8RTM",
    },
]


def read_hive(hive: int, path: str):
    entries: HiveData = {}

    with OpenKeyEx(hive, path, 0, KEY_READ | KEY_WOW64_64KEY) as key:
        for i in range(QueryInfoKey(key)[1]):
            name, value, type = EnumValue(key, i)

            if isinstance(value, str) and type == REG_SZ:
                flags = value.split(" ")
                parsed_options: CompatibilityOptions = [None] * len(options_map)

                for flag in flags:
                    for index, valid_options in enumerate(options_map):
                        if flag in valid_options:
                            parsed_options[index] = flag
                            break

                entries[name] = parsed_options

    return entries


def get_compatibility_options():
    return {
        "HKLM": read_hive(HKEY_LOCAL_MACHINE, HKLM_PATH),
        "HKCU": read_hive(HKEY_CURRENT_USER, HKCU_PATH),
    }
