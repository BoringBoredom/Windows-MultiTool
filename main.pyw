from functools import wraps
from os import path
from traceback import format_exc
from typing import Callable, Literal, ParamSpec, TypeVar

from webview import SAVE_DIALOG, create_window, start

P = ParamSpec("P")
R = TypeVar("R")


def handle_api_errors(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            raise Exception(format_exc())

    return wrapper


class Api:
    @handle_api_errors
    def getSystemInfo(self):
        from py.PCI_IRQs import get_system_info

        return get_system_info()

    @handle_api_errors
    def getDisplayInfo(self):
        from py.DISPLAY_INFO import get_display_info

        return get_display_info()

    @handle_api_errors
    def writeRegistryValue(
        self,
        hkey_str: Literal["HKLM", "HKCU"],
        path: str,
        name: str,
        type: int,
        value: int | str,
    ):
        from py.utils import write_registry_value

        write_registry_value(hkey_str, path, name, type, value)

    @handle_api_errors
    def deleteRegistryValue(
        self, hkey_str: Literal["HKLM", "HKCU"], path: str, value: str
    ):
        from py.utils import delete_registry_value

        delete_registry_value(hkey_str, path, value)

    @handle_api_errors
    def deleteRegistryKey(self, path: str, key: str):
        from py.utils import delete_registry_key

        delete_registry_key(path, key)

    @handle_api_errors
    def createRegistryKey(self, path: str):
        from py.utils import create_registry_key

        create_registry_key(path)

    @handle_api_errors
    def openURL(self, url: str):
        from webbrowser import open

        open(url)

    @handle_api_errors
    def getIfeoData(self):
        from py.IFEO import get_ifeo_data

        return get_ifeo_data()

    @handle_api_errors
    def getSchedulingInfo(self):
        from py.SCHEDULING import get_scheduling_info

        return get_scheduling_info()

    @handle_api_errors
    def getPowerSettings(self):
        from py.POWER_SETTINGS import get_power_settings

        return get_power_settings()

    @handle_api_errors
    def writeValueIndex(
        self,
        scheme_guid_str: str,
        subgroup_guid_str: str,
        setting_guid_str: str,
        value_index: int,
        is_ac: bool,
    ):
        from py.POWER_SETTINGS import write_value_index

        write_value_index(
            scheme_guid_str, subgroup_guid_str, setting_guid_str, value_index, is_ac
        )

    @handle_api_errors
    def setActiveScheme(self, scheme_guid_str: str):
        from py.POWER_SETTINGS import set_active_scheme

        set_active_scheme(scheme_guid_str)

    @handle_api_errors
    def getCompatibilityOptions(self):
        from py.COMPATIBILITY_OPTIONS import get_compatibility_options

        return get_compatibility_options()

    @handle_api_errors
    def saveFile(self, file_name: str, file_types: tuple[str], content: str):
        path = window.create_file_dialog(
            SAVE_DIALOG,
            directory="/",
            save_filename=file_name,
            file_types=file_types,
        )

        if path is None:
            return

        with open(str(path), "w", encoding="utf-8") as file:
            file.write(content)

    @handle_api_errors
    def exportPowerScheme(self, guid: str, file_name: str, file_types: tuple[str]):
        path = window.create_file_dialog(
            SAVE_DIALOG,
            directory="/",
            save_filename=file_name,
            file_types=file_types,
        )

        if path is None:
            return

        from subprocess import CREATE_NO_WINDOW, run

        run(
            ["powercfg", "/export", str(path), guid],
            check=True,
            creationflags=CREATE_NO_WINDOW,
        )


def on_shown():
    window.maximize()


if __name__ == "__main__":
    isDevEnv = not path.exists(path.join(path.dirname(__file__), "gui/index.html"))
    entry_point = "http://localhost:5173/" if isDevEnv else "gui/index.html"

    window = create_window(
        "Windows MultiTool", entry_point, js_api=Api(), text_select=True
    )
    window.events.shown += on_shown

    start(ssl=True, debug=isDevEnv)
