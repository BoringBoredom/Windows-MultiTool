from os import path

import webview


class Api:
    def getSystemInfo(self):
        from py.PCI_IRQs import get_system_info

        return get_system_info()

    def getDisplayInfo(self):
        from py.DISPLAY_INFO import get_display_info

        return get_display_info()

    def writeRegistryValue(self, path: str, name: str, type: int, value: int | str):
        from py.utils import write_registry_value

        write_registry_value(path, name, type, value)

    def deleteRegistryValue(self, path: str, value: str):
        from py.utils import delete_registry_value

        delete_registry_value(path, value)

    def deleteRegistryKey(self, path: str, key: str):
        from py.utils import delete_registry_key

        delete_registry_key(path, key)

    def createRegistryKey(self, path: str):
        from py.utils import create_registry_key

        create_registry_key(path)

    def openURL(self, url: str):
        from webbrowser import open

        open(url)

    def getIfeoData(self):
        from py.IFEO import get_ifeo_data

        return get_ifeo_data()

    def getSchedulingInfo(self):
        from py.SCHEDULING import get_scheduling_info

        return get_scheduling_info()

    def getPowerSettings(self):
        from py.POWER_SETTINGS import get_power_settings

        return get_power_settings()

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

    def setActiveScheme(self, scheme_guid_str: str):
        from py.POWER_SETTINGS import set_active_scheme

        set_active_scheme(scheme_guid_str)


def on_shown(window):  # type: ignore
    window.maximize()  # type: ignore


if __name__ == "__main__":
    isDevEnv = not path.exists(path.join(path.dirname(__file__), "gui/index.html"))
    entry_point = "http://localhost:5173/" if isDevEnv else "gui/index.html"

    window = webview.create_window(
        "Windows MultiTool", entry_point, js_api=Api(), text_select=True
    )
    window.events.shown += on_shown

    webview.start(ssl=True, debug=isDevEnv)
