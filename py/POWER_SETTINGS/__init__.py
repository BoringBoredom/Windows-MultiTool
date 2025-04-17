from ctypes import (
    POINTER,
    Structure,
    WinError,
    byref,
    c_ubyte,
    c_ulong,
    c_ushort,
    create_unicode_buffer,
    sizeof,
    windll,
)
from typing import Final, List, TypedDict, cast


class GUID(Structure):
    _fields_ = [
        ("Data1", c_ulong),
        ("Data2", c_ushort),
        ("Data3", c_ushort),
        ("Data4", c_ubyte * 8),
    ]


class SubGroup(TypedDict):
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
    options: List[Option] | None
    range: Range | None
    subgroup: SubGroup
    ac: int
    dc: int


class PowerScheme(TypedDict):
    guid: str
    name: str
    settings: List[Setting]


ERROR_FILE_NOT_FOUND: Final = 2
ERROR_NO_MORE_ITEMS: Final = 259

ACCESS_SCHEME: Final = 16
ACCESS_SUBGROUP: Final = 17
ACCESS_INDIVIDUAL_SETTING: Final = 18

powrprof = windll.powrprof
PowerGetActiveScheme = powrprof.PowerGetActiveScheme
PowerEnumerate = powrprof.PowerEnumerate
PowerReadFriendlyName = powrprof.PowerReadFriendlyName
PowerReadACValueIndex = powrprof.PowerReadACValueIndex
PowerReadDCValueIndex = powrprof.PowerReadDCValueIndex
PowerReadValueMin = powrprof.PowerReadValueMin
PowerReadValueMax = powrprof.PowerReadValueMax
PowerReadValueIncrement = powrprof.PowerReadValueIncrement
PowerReadValueUnitsSpecifier = powrprof.PowerReadValueUnitsSpecifier
PowerReadPossibleFriendlyName = powrprof.PowerReadPossibleFriendlyName
PowerReadDescription = powrprof.PowerReadDescription
PowerReadPossibleDescription = powrprof.PowerReadPossibleDescription
PowerWriteACValueIndex = powrprof.PowerWriteACValueIndex
PowerWriteDCValueIndex = powrprof.PowerWriteDCValueIndex
PowerSetActiveScheme = powrprof.PowerSetActiveScheme

LocalFree = windll.kernel32.LocalFree


def set_active_scheme(scheme_guid_str: str):
    result = PowerSetActiveScheme(
        None,
        byref(string_to_guid(scheme_guid_str)),
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
            byref(string_to_guid(scheme_guid_str)),
            byref(string_to_guid(subgroup_guid_str)),
            byref(string_to_guid(setting_guid_str)),
            value_index,
        )
        if result != 0:
            raise WinError(result)
    else:
        result = PowerWriteDCValueIndex(
            None,
            byref(string_to_guid(scheme_guid_str)),
            byref(string_to_guid(subgroup_guid_str)),
            byref(string_to_guid(setting_guid_str)),
            value_index,
        )
        if result != 0:
            raise WinError(result)

    set_active_scheme(scheme_guid_str)


def string_to_guid(guid_str: str):
    parts = guid_str.split("-")

    data1 = int(parts[0], 16)
    data2 = int(parts[1], 16)
    data3 = int(parts[2], 16)
    data4 = bytes.fromhex(parts[3]) + bytes.fromhex(parts[4])

    guid = GUID()
    guid.Data1 = c_ulong(data1)
    guid.Data2 = c_ushort(data2)
    guid.Data3 = c_ushort(data3)
    guid.Data4 = (c_ubyte * 8)(*data4)

    return guid


def guid_to_string(guid: GUID):
    return (
        "{:08x}-{:04x}-{:04x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}".format(
            guid.Data1,
            guid.Data2,
            guid.Data3,
            guid.Data4[0],
            guid.Data4[1],
            guid.Data4[2],
            guid.Data4[3],
            guid.Data4[4],
            guid.Data4[5],
            guid.Data4[6],
            guid.Data4[7],
        )
    )


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
    current_scheme_settings: List[Setting],
    current_subgroup: SubGroup,
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
            ACCESS_INDIVIDUAL_SETTING,
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
        setting_options: List[Option] | None = None

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
            "guid": guid_to_string(setting_guid),
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
    power_schemes: List[PowerScheme] = []

    scheme_index = 0
    while True:
        scheme_guid = GUID()

        buffer_size = c_ulong(sizeof(scheme_guid))
        result = PowerEnumerate(
            None,
            None,
            None,
            ACCESS_SCHEME,
            scheme_index,
            byref(scheme_guid),
            byref(buffer_size),
        )
        scheme_index += 1

        if result == ERROR_NO_MORE_ITEMS:
            break
        if result != 0:
            raise WinError(result)

        current_scheme_settings: List[Setting] = []

        current_subgroup: SubGroup = {
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
                ACCESS_SUBGROUP,
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
                "guid": guid_to_string(subgroup_guid),
                "name": get_friendly_name(
                    scheme_guid=scheme_guid, subgroup_guid=subgroup_guid
                ),
            }

            get_settings(
                scheme_guid, current_scheme_settings, current_subgroup, subgroup_guid
            )

        power_schemes.append(
            {
                "guid": guid_to_string(scheme_guid),
                "name": get_friendly_name(scheme_guid=scheme_guid),
                "settings": current_scheme_settings,
            }
        )

    active_scheme_guid_ptr = POINTER(GUID)()
    result = PowerGetActiveScheme(None, byref(active_scheme_guid_ptr))
    if result != 0:
        raise WinError(result)

    active_guid_str = guid_to_string(active_scheme_guid_ptr.contents)
    LocalFree(active_scheme_guid_ptr)

    return {"activeSchemeGuid": active_guid_str, "powerSchemes": power_schemes}
