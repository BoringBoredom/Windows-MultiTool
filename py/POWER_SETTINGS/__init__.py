from ctypes import (
    POINTER,
    WinError,
    byref,
    c_long,
    c_ulong,
    c_wchar_p,
    create_unicode_buffer,
    sizeof,
    windll,
)
from ctypes.wintypes import DWORD, HKEY, HLOCAL
from typing import Final, TypedDict, cast

from py.utils import GUID


class Subgroup(TypedDict):
    guid: str
    name: str | None


class Option(TypedDict):
    index: int
    name: str
    description: str


class Range(TypedDict):
    min: int
    max: int
    increment: int
    unit: str


class Setting(TypedDict):
    guid: str
    name: str
    description: str
    options: list[Option] | None
    range: Range | None
    subgroup: Subgroup
    ac: int
    dc: int


class PowerScheme(TypedDict):
    guid: str
    name: str
    settings: list[Setting]


class POWER_DATA_ACCESSOR(c_long):
    ACCESS_SCHEME = 16
    ACCESS_SUBGROUP = 17
    ACCESS_INDIVIDUAL_SETTING = 18


ERROR_FILE_NOT_FOUND: Final = 2
ERROR_NO_MORE_ITEMS: Final = 259

powrprof = windll.powrprof

PowerGetActiveScheme = powrprof.PowerGetActiveScheme
PowerGetActiveScheme.argtypes = [HKEY, POINTER(POINTER(GUID))]
PowerGetActiveScheme.restype = DWORD

PowerEnumerate = powrprof.PowerEnumerate
PowerEnumerate.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POWER_DATA_ACCESSOR,
    c_ulong,
    POINTER(GUID),
    POINTER(DWORD),
]
PowerEnumerate.restype = DWORD

PowerReadFriendlyName = powrprof.PowerReadFriendlyName
PowerReadFriendlyName.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    c_wchar_p,
    POINTER(DWORD),
]
PowerReadFriendlyName.restype = DWORD

PowerReadACValueIndex = powrprof.PowerReadACValueIndex
PowerReadACValueIndex.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    POINTER(DWORD),
]
PowerReadACValueIndex.restype = DWORD

PowerReadDCValueIndex = powrprof.PowerReadDCValueIndex
PowerReadDCValueIndex.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    POINTER(DWORD),
]
PowerReadDCValueIndex.restype = DWORD

PowerReadValueMin = powrprof.PowerReadValueMin
PowerReadValueMin.argtypes = [HKEY, POINTER(GUID), POINTER(GUID), POINTER(DWORD)]
PowerReadValueMin.restype = DWORD

PowerReadValueMax = powrprof.PowerReadValueMax
PowerReadValueMax.argtypes = [HKEY, POINTER(GUID), POINTER(GUID), POINTER(DWORD)]
PowerReadValueMax.restype = DWORD

PowerReadValueIncrement = powrprof.PowerReadValueIncrement
PowerReadValueIncrement.argtypes = [HKEY, POINTER(GUID), POINTER(GUID), POINTER(DWORD)]
PowerReadValueIncrement.restype = DWORD

PowerReadValueUnitsSpecifier = powrprof.PowerReadValueUnitsSpecifier
PowerReadValueUnitsSpecifier.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    c_wchar_p,
    POINTER(DWORD),
]
PowerReadValueUnitsSpecifier.restype = DWORD

PowerReadPossibleFriendlyName = powrprof.PowerReadPossibleFriendlyName
PowerReadPossibleFriendlyName.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    c_ulong,
    c_wchar_p,
    POINTER(DWORD),
]
PowerReadPossibleFriendlyName.restype = DWORD

PowerReadDescription = powrprof.PowerReadDescription
PowerReadDescription.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    c_wchar_p,
    POINTER(DWORD),
]
PowerReadDescription.restype = DWORD

PowerReadPossibleDescription = powrprof.PowerReadPossibleDescription
PowerReadPossibleDescription.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    c_ulong,
    c_wchar_p,
    POINTER(DWORD),
]
PowerReadPossibleDescription.restype = DWORD

PowerWriteACValueIndex = powrprof.PowerWriteACValueIndex
PowerWriteACValueIndex.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    DWORD,
]
PowerWriteACValueIndex.restype = DWORD

PowerWriteDCValueIndex = powrprof.PowerWriteDCValueIndex
PowerWriteDCValueIndex.argtypes = [
    HKEY,
    POINTER(GUID),
    POINTER(GUID),
    POINTER(GUID),
    DWORD,
]
PowerWriteDCValueIndex.restype = DWORD

PowerSetActiveScheme = powrprof.PowerSetActiveScheme
PowerSetActiveScheme.argtypes = [HKEY, POINTER(GUID)]
PowerSetActiveScheme.restype = DWORD

LocalFree = windll.kernel32.LocalFree
LocalFree.argtypes = [HLOCAL]
LocalFree.restype = HLOCAL


def set_active_scheme(scheme_guid_str: str):
    result = PowerSetActiveScheme(
        None,
        byref(GUID(scheme_guid_str)),
    )
    if result != 0:
        raise WinError(result)


def write_value_index(
    scheme_guid_str: str,
    subgroup_guid_str: str,
    setting_guid_str: str,
    value_index: int,
    is_ac: bool,
):
    if is_ac:
        result = PowerWriteACValueIndex(
            None,
            byref(GUID(scheme_guid_str)),
            byref(GUID(subgroup_guid_str)),
            byref(GUID(setting_guid_str)),
            value_index,
        )
        if result != 0:
            raise WinError(result)
    else:
        result = PowerWriteDCValueIndex(
            None,
            byref(GUID(scheme_guid_str)),
            byref(GUID(subgroup_guid_str)),
            byref(GUID(setting_guid_str)),
            value_index,
        )
        if result != 0:
            raise WinError(result)

    set_active_scheme(scheme_guid_str)


def get_friendly_name(
    scheme_guid: GUID | None = None,
    subgroup_guid: GUID | None = None,
    setting_guid: GUID | None = None,
):
    buffer_size = c_ulong()
    result = PowerReadFriendlyName(
        None,
        byref(scheme_guid) if scheme_guid else None,
        byref(subgroup_guid) if subgroup_guid else None,
        byref(setting_guid) if setting_guid else None,
        None,
        byref(buffer_size),
    )
    if result == ERROR_FILE_NOT_FOUND:
        return ""
    if result != 0:
        raise WinError(result)

    buffer = create_unicode_buffer(buffer_size.value)
    result = PowerReadFriendlyName(
        None,
        byref(scheme_guid) if scheme_guid else None,
        byref(subgroup_guid) if subgroup_guid else None,
        byref(setting_guid) if setting_guid else None,
        buffer,
        byref(buffer_size),
    )
    if result != 0:
        raise WinError(result)

    return cast(str, buffer.value)


def get_settings(
    scheme_guid: GUID,
    current_scheme_settings: list[Setting],
    current_subgroup: Subgroup,
    subgroup_guid: GUID | None = None,
):
    setting_index = 0
    while True:
        setting_guid = GUID()

        buffer_size = c_ulong(sizeof(setting_guid))
        result = PowerEnumerate(
            None,
            byref(scheme_guid),
            byref(subgroup_guid) if subgroup_guid else None,
            POWER_DATA_ACCESSOR.ACCESS_INDIVIDUAL_SETTING,
            setting_index,
            byref(setting_guid),
            byref(buffer_size),
        )
        setting_index += 1

        if result == ERROR_NO_MORE_ITEMS:
            break
        if result != 0:
            raise WinError(result)

        buffer_size = c_ulong()
        result = PowerReadDescription(
            None,
            byref(scheme_guid),
            byref(subgroup_guid) if subgroup_guid else None,
            byref(setting_guid),
            None,
            byref(buffer_size),
        )
        if result != 0:
            raise WinError(result)

        description_buffer = create_unicode_buffer(buffer_size.value)
        result = PowerReadDescription(
            None,
            byref(scheme_guid),
            byref(subgroup_guid) if subgroup_guid else None,
            byref(setting_guid),
            description_buffer,
            byref(buffer_size),
        )
        if result != 0:
            raise WinError(result)

        ac_value_index = c_ulong()
        result = PowerReadACValueIndex(
            None,
            byref(scheme_guid),
            byref(subgroup_guid) if subgroup_guid else None,
            byref(setting_guid),
            byref(ac_value_index),
        )
        if result != 0:
            raise WinError(result)

        dc_value_index = c_ulong()
        result = PowerReadDCValueIndex(
            None,
            byref(scheme_guid),
            byref(subgroup_guid) if subgroup_guid else None,
            byref(setting_guid),
            byref(dc_value_index),
        )
        if result != 0:
            raise WinError(result)

        setting_range: Range | None = None
        setting_options: list[Option] | None = None

        min_value = c_ulong()
        result = PowerReadValueMin(
            None,
            byref(subgroup_guid) if subgroup_guid else None,
            byref(setting_guid),
            byref(min_value),
        )
        if result == 0:
            max_value = c_ulong()
            result = PowerReadValueMax(
                None,
                byref(subgroup_guid) if subgroup_guid else None,
                byref(setting_guid),
                byref(max_value),
            )
            if result != 0:
                raise WinError(result)

            increment_value = c_ulong()
            result = PowerReadValueIncrement(
                None,
                byref(subgroup_guid) if subgroup_guid else None,
                byref(setting_guid),
                byref(increment_value),
            )
            if result != 0:
                raise WinError(result)

            buffer_size = c_ulong()
            result = PowerReadValueUnitsSpecifier(
                None,
                byref(subgroup_guid) if subgroup_guid else None,
                byref(setting_guid),
                None,
                byref(buffer_size),
            )
            if result != 0:
                raise WinError(result)

            unit_buffer = create_unicode_buffer(buffer_size.value)
            result = PowerReadValueUnitsSpecifier(
                None,
                byref(subgroup_guid) if subgroup_guid else None,
                byref(setting_guid),
                unit_buffer,
                byref(buffer_size),
            )
            if result != 0:
                raise WinError(result)

            setting_range = {
                "min": min_value.value,
                "max": max_value.value,
                "increment": increment_value.value,
                "unit": unit_buffer.value,
            }
        else:
            setting_options = []

            option_index = 0
            while True:
                buffer_size = c_ulong()
                result = PowerReadPossibleFriendlyName(
                    None,
                    byref(subgroup_guid) if subgroup_guid else None,
                    byref(setting_guid),
                    option_index,
                    None,
                    byref(buffer_size),
                )
                if result == ERROR_FILE_NOT_FOUND:
                    break
                if result != 0:
                    raise WinError(result)

                option_buffer = create_unicode_buffer(buffer_size.value)
                result = PowerReadPossibleFriendlyName(
                    None,
                    byref(subgroup_guid) if subgroup_guid else None,
                    byref(setting_guid),
                    option_index,
                    option_buffer,
                    byref(buffer_size),
                )
                if result != 0:
                    raise WinError(result)

                buffer_size = c_ulong()
                result = PowerReadPossibleDescription(
                    None,
                    byref(subgroup_guid) if subgroup_guid else None,
                    byref(setting_guid),
                    option_index,
                    None,
                    byref(buffer_size),
                )
                if result != 0:
                    raise WinError(result)

                description_buffer = create_unicode_buffer(buffer_size.value)
                result = PowerReadPossibleDescription(
                    None,
                    byref(subgroup_guid) if subgroup_guid else None,
                    byref(setting_guid),
                    option_index,
                    description_buffer,
                    byref(buffer_size),
                )
                if result != 0:
                    raise WinError(result)

                setting_options.append(
                    {
                        "index": option_index,
                        "name": option_buffer.value,
                        "description": description_buffer.value,
                    }
                )

                option_index += 1

            if option_index == 0:
                setting_options = None

        current_setting: Setting = {
            "guid": str(setting_guid),
            "name": get_friendly_name(
                scheme_guid=scheme_guid,
                subgroup_guid=subgroup_guid,
                setting_guid=setting_guid,
            ),
            "description": description_buffer.value,
            "subgroup": current_subgroup,
            "ac": ac_value_index.value,
            "dc": dc_value_index.value,
            "options": setting_options,
            "range": setting_range,
        }

        current_scheme_settings.append(current_setting)


def get_power_settings():
    power_schemes: list[PowerScheme] = []

    scheme_index = 0
    while True:
        scheme_guid = GUID()

        buffer_size = c_ulong(sizeof(scheme_guid))
        result = PowerEnumerate(
            None,
            None,
            None,
            POWER_DATA_ACCESSOR.ACCESS_SCHEME,
            scheme_index,
            byref(scheme_guid),
            byref(buffer_size),
        )
        scheme_index += 1

        if result == ERROR_NO_MORE_ITEMS:
            break
        if result != 0:
            raise WinError(result)

        current_scheme_settings: list[Setting] = []

        current_subgroup: Subgroup = {
            "guid": "fea3413e-7e05-4911-9a71-700331f1c294",
            "name": "NO_SUBGROUP_GUID",
        }

        get_settings(scheme_guid, current_scheme_settings, current_subgroup)

        subgroup_index = 0
        while True:
            subgroup_guid = GUID()

            buffer_size = c_ulong(sizeof(subgroup_guid))
            result = PowerEnumerate(
                None,
                byref(scheme_guid),
                None,
                POWER_DATA_ACCESSOR.ACCESS_SUBGROUP,
                subgroup_index,
                byref(subgroup_guid),
                byref(buffer_size),
            )
            subgroup_index += 1

            if result == ERROR_NO_MORE_ITEMS:
                break
            if result != 0:
                raise WinError(result)

            current_subgroup = {
                "guid": str(subgroup_guid),
                "name": get_friendly_name(
                    scheme_guid=scheme_guid, subgroup_guid=subgroup_guid
                ),
            }

            get_settings(
                scheme_guid, current_scheme_settings, current_subgroup, subgroup_guid
            )

        power_schemes.append(
            {
                "guid": str(scheme_guid),
                "name": get_friendly_name(scheme_guid=scheme_guid),
                "settings": current_scheme_settings,
            }
        )

    active_scheme_guid_ptr = POINTER(GUID)()
    result = PowerGetActiveScheme(None, byref(active_scheme_guid_ptr))
    if result != 0:
        raise WinError(result)

    active_guid_str = str(active_scheme_guid_ptr.contents)
    LocalFree(active_scheme_guid_ptr)

    return {"activeSchemeGuid": active_guid_str, "powerSchemes": power_schemes}
