import winreg
from typing import Dict, Final, TypedDict

BASE_PATH: Final = (
    r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options"
)


class IFEO(TypedDict):
    Path: str
    CpuPriorityClass: int | None
    IoPriority: int | None
    PagePriority: int | None


IfeoData = Dict[str, IFEO]


def get_ifeo_data():
    ifeo: IfeoData = {}

    with winreg.OpenKeyEx(
        winreg.HKEY_LOCAL_MACHINE,
        BASE_PATH,
        0,
        winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
    ) as base_key:
        for i in range(winreg.QueryInfoKey(base_key)[0]):
            process_name = winreg.EnumKey(base_key, i)
            subkey_path = f"{BASE_PATH}\\{process_name}"

            try:
                with winreg.OpenKeyEx(
                    winreg.HKEY_LOCAL_MACHINE,
                    subkey_path + r"\PerfOptions",
                    0,
                    winreg.KEY_READ | winreg.KEY_WOW64_64KEY,
                ) as perf_options_key:
                    try:
                        cpu_priority_class = winreg.QueryValueEx(
                            perf_options_key, "CpuPriorityClass"
                        )[0]
                    except FileNotFoundError:
                        cpu_priority_class = None

                    try:
                        io_priority = winreg.QueryValueEx(
                            perf_options_key, "IoPriority"
                        )[0]
                    except FileNotFoundError:
                        io_priority = None

                    try:
                        page_priority = winreg.QueryValueEx(
                            perf_options_key, "PagePriority"
                        )[0]
                    except FileNotFoundError:
                        page_priority = None

                    ifeo[process_name] = {
                        "Path": subkey_path,
                        "CpuPriorityClass": cpu_priority_class,
                        "IoPriority": io_priority,
                        "PagePriority": page_priority,
                    }
            except FileNotFoundError:
                pass

    return ifeo
