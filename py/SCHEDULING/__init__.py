import winreg
from os import cpu_count
from typing import Final

KERNEL_PATH: Final = r"SYSTEM\CurrentControlSet\Control\Session Manager\kernel"


def get_scheduling_info():
    with winreg.OpenKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        KERNEL_PATH,
        0,
        winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
    ) as base_key:
        try:
            reserved_cpu_sets = int.from_bytes(
                winreg.QueryValueEx(base_key, "ReservedCpuSets")[0], "little"
            )
        except FileNotFoundError:
            reserved_cpu_sets = None

        try:
            with winreg.OpenKeyEx(
                winreg.HKEY_LOCAL_MACHINE,
                KERNEL_PATH + r"KGroups\00",
                0,
                winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
            ) as kgroup_key:
                small_processor_mask = int.from_bytes(
                    winreg.QueryValueEx(kgroup_key, "SmallProcessorMask")[0], "little"
                )
        except FileNotFoundError:
            small_processor_mask = None

    return {
        "ReservedCpuSets": reserved_cpu_sets,
        "SmallProcessorMask": small_processor_mask,
        "cpu": {"cpus": cpu_count()},
    }
