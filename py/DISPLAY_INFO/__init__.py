from ctypes import (
    POINTER,
    Structure,
    Union,
    WinError,
    byref,
    c_float,
    c_uint,
    c_uint16,
    c_uint32,
    c_uint64,
    sizeof,
    windll,
)
from ctypes.wintypes import BOOL, LONG, POINTL, RECTL, ULONG, WCHAR
from typing import Final, List, TypedDict


class LUID(Structure):
    _fields_ = [("LowPart", ULONG), ("HighPart", LONG)]


class DUMMYSTRUCTNAME_PATH_SOURCE_INFO(Structure):
    _fields_ = [
        ("cloneGroupId", c_uint32, 16),
        ("sourceModeInfoIdx", c_uint32, 16),
    ]


class DUMMYUNIONNAME_PATH_SOURCE_INFO(Union):
    _fields_ = [
        ("modeInfoIdx", c_uint32),
        ("DUMMYSTRUCTNAME", DUMMYSTRUCTNAME_PATH_SOURCE_INFO),
    ]


class DISPLAYCONFIG_PATH_SOURCE_INFO(Structure):
    _fields_ = [
        ("adapterId", LUID),
        ("id", c_uint32),
        ("DUMMYUNIONNAME", DUMMYUNIONNAME_PATH_SOURCE_INFO),
        ("statusFlags", c_uint32),
    ]


class DUMMYSTRUCTNAME_PATH_TARGET_INFO(Structure):
    _fields_ = [
        ("desktopModeInfoIdx", c_uint32, 16),
        ("targetModeInfoIdx", c_uint32, 16),
    ]


class DUMMYUNIONNAME_PATH_TARGET_INFO(Union):
    _fields_ = [
        ("modeInfoIdx", c_uint32),
        ("DUMMYSTRUCTNAME", DUMMYSTRUCTNAME_PATH_TARGET_INFO),
    ]


class DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY(c_uint32):
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_OTHER = -1
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_HD15 = 0
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_SVIDEO = 1
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_COMPOSITE_VIDEO = 2
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_COMPONENT_VIDEO = 3
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_DVI = 4
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_HDMI = 5
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_LVDS = 6
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_D_JPN = 8
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_SDI = 9
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_DISPLAYPORT_EXTERNAL = 10
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_DISPLAYPORT_EMBEDDED = 11
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_UDI_EXTERNAL = 12
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_UDI_EMBEDDED = 13
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_SDTVDONGLE = 14
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_MIRACAST = 15
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_INDIRECT_WIRED = 16
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_INDIRECT_VIRTUAL = 17
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_DISPLAYPORT_USB_TUNNEL = 18
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_INTERNAL = 0x80000000
    DISPLAYCONFIG_OUTPUT_TECHNOLOGY_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_ROTATION(c_uint32):
    DISPLAYCONFIG_ROTATION_IDENTITY = 1
    DISPLAYCONFIG_ROTATION_ROTATE90 = 2
    DISPLAYCONFIG_ROTATION_ROTATE180 = 3
    DISPLAYCONFIG_ROTATION_ROTATE270 = 4
    DISPLAYCONFIG_ROTATION_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_SCALING(c_uint32):
    DISPLAYCONFIG_SCALING_IDENTITY = 1
    DISPLAYCONFIG_SCALING_CENTERED = 2
    DISPLAYCONFIG_SCALING_STRETCHED = 3
    DISPLAYCONFIG_SCALING_ASPECTRATIOCENTEREDMAX = 4
    DISPLAYCONFIG_SCALING_CUSTOM = 5
    DISPLAYCONFIG_SCALING_PREFERRED = 128
    DISPLAYCONFIG_SCALING_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_RATIONAL(Structure):
    _fields_ = [("Numerator", c_uint32), ("Denominator", c_uint32)]


class DISPLAYCONFIG_SCANLINE_ORDERING(c_uint32):
    DISPLAYCONFIG_SCANLINE_ORDERING_UNSPECIFIED = 0
    DISPLAYCONFIG_SCANLINE_ORDERING_PROGRESSIVE = 1
    DISPLAYCONFIG_SCANLINE_ORDERING_INTERLACED = 2
    DISPLAYCONFIG_SCANLINE_ORDERING_INTERLACED_UPPERFIELDFIRST = 3
    DISPLAYCONFIG_SCANLINE_ORDERING_INTERLACED_LOWERFIELDFIRST = 3
    DISPLAYCONFIG_SCANLINE_ORDERING_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_PATH_TARGET_INFO(Structure):
    _fields_ = [
        ("adapterId", LUID),
        ("id", c_uint32),
        ("DUMMYUNIONNAME", DUMMYUNIONNAME_PATH_TARGET_INFO),
        ("outputTechnology", DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY),
        ("rotation", DISPLAYCONFIG_ROTATION),
        ("scaling", DISPLAYCONFIG_SCALING),
        ("refreshRate", DISPLAYCONFIG_RATIONAL),
        ("scanLineOrdering", DISPLAYCONFIG_SCANLINE_ORDERING),
        ("targetAvailable", BOOL),
        ("statusFlags", c_uint32),
    ]


class DISPLAYCONFIG_PATH_INFO(Structure):
    _fields_ = [
        ("sourceInfo", DISPLAYCONFIG_PATH_SOURCE_INFO),
        ("targetInfo", DISPLAYCONFIG_PATH_TARGET_INFO),
        ("flags", c_uint32),
    ]


class DISPLAYCONFIG_MODE_INFO_TYPE(c_uint32):
    DISPLAYCONFIG_MODE_INFO_TYPE_SOURCE = 1
    DISPLAYCONFIG_MODE_INFO_TYPE_TARGET = 2
    DISPLAYCONFIG_MODE_INFO_TYPE_DESKTOP_IMAGE = 3
    DISPLAYCONFIG_MODE_INFO_TYPE_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_DESKTOP_IMAGE_INFO(Structure):
    _fields_ = [
        ("PathSourceSize", POINTL),
        ("DesktopImageRegion", RECTL),
        ("DesktopImageClip", RECTL),
    ]


class DISPLAYCONFIG_2DREGION(Structure):
    _fields_ = [("cx", c_uint32), ("cy", c_uint32)]


class AdditionalSignalInfo(Structure):
    _fields_ = [
        ("videoStandard", c_uint32, 16),
        ("vSyncFreqDivider", c_uint32, 6),
        ("reserved", c_uint32, 10),
    ]


class DUMMYUNIONNAME_VIDEO_SIGNAL_INFO(Union):
    _fields_ = [
        ("AdditionalSignalInfo", AdditionalSignalInfo),
        ("videoStandard", c_uint32),
    ]


class DISPLAYCONFIG_VIDEO_SIGNAL_INFO(Structure):
    _fields_ = [
        ("pixelRate", c_uint64),
        ("hSyncFreq", DISPLAYCONFIG_RATIONAL),
        ("vSyncFreq", DISPLAYCONFIG_RATIONAL),
        ("activeSize", DISPLAYCONFIG_2DREGION),
        ("totalSize", DISPLAYCONFIG_2DREGION),
        ("DUMMYUNIONNAME", DUMMYUNIONNAME_VIDEO_SIGNAL_INFO),
        ("scanLineOrdering", DISPLAYCONFIG_SCANLINE_ORDERING),
    ]


class DISPLAYCONFIG_TARGET_MODE(Structure):
    _fields_ = [("targetVideoSignalInfo", DISPLAYCONFIG_VIDEO_SIGNAL_INFO)]


class DISPLAYCONFIG_PIXELFORMAT(c_uint32):
    DISPLAYCONFIG_PIXELFORMAT_8BPP = 1
    DISPLAYCONFIG_PIXELFORMAT_16BPP = 2
    DISPLAYCONFIG_PIXELFORMAT_24BPP = 3
    DISPLAYCONFIG_PIXELFORMAT_32BPP = 4
    DISPLAYCONFIG_PIXELFORMAT_NONGDI = 5
    DISPLAYCONFIG_PIXELFORMAT_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_SOURCE_MODE(Structure):
    _fields_ = [
        ("width", c_uint32),
        ("height", c_uint32),
        ("pixelFormat", DISPLAYCONFIG_PIXELFORMAT),
        ("position", POINTL),
    ]


class DUMMYUNIONNAME_MODE_INFO(Union):
    _fields_ = [
        ("targetMode", DISPLAYCONFIG_TARGET_MODE),
        ("sourceMode", DISPLAYCONFIG_SOURCE_MODE),
        ("desktopImageInfo", DISPLAYCONFIG_DESKTOP_IMAGE_INFO),
    ]


class DISPLAYCONFIG_MODE_INFO(Structure):
    _fields_ = [
        ("infoType", DISPLAYCONFIG_MODE_INFO_TYPE),
        ("id", c_uint32),
        ("adapterId", LUID),
        ("DUMMYUNIONNAME", DUMMYUNIONNAME_MODE_INFO),
    ]


class DISPLAYCONFIG_DEVICE_INFO_TYPE(c_uint32):
    DISPLAYCONFIG_DEVICE_INFO_GET_SOURCE_NAME = 1
    DISPLAYCONFIG_DEVICE_INFO_GET_TARGET_NAME = 2
    DISPLAYCONFIG_DEVICE_INFO_GET_TARGET_PREFERRED_MODE = 3
    DISPLAYCONFIG_DEVICE_INFO_GET_ADAPTER_NAME = 4
    DISPLAYCONFIG_DEVICE_INFO_SET_TARGET_PERSISTENCE = 5
    DISPLAYCONFIG_DEVICE_INFO_GET_TARGET_BASE_TYPE = 6
    DISPLAYCONFIG_DEVICE_INFO_GET_SUPPORT_VIRTUAL_RESOLUTION = 7
    DISPLAYCONFIG_DEVICE_INFO_SET_SUPPORT_VIRTUAL_RESOLUTION = 8
    DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO = 9
    DISPLAYCONFIG_DEVICE_INFO_SET_ADVANCED_COLOR_STATE = 10
    DISPLAYCONFIG_DEVICE_INFO_GET_SDR_WHITE_LEVEL = 11
    DISPLAYCONFIG_DEVICE_INFO_GET_MONITOR_SPECIALIZATION = 12
    DISPLAYCONFIG_DEVICE_INFO_SET_MONITOR_SPECIALIZATION = 13
    DISPLAYCONFIG_DEVICE_INFO_SET_RESERVED1 = 14
    DISPLAYCONFIG_DEVICE_INFO_GET_ADVANCED_COLOR_INFO_2 = 15
    DISPLAYCONFIG_DEVICE_INFO_SET_HDR_STATE = 16
    DISPLAYCONFIG_DEVICE_INFO_SET_WCG_STATE = 17
    DISPLAYCONFIG_DEVICE_INFO_FORCE_UINT32 = 0xFFFFFFFF


class DISPLAYCONFIG_DEVICE_INFO_HEADER(Structure):
    _fields_ = [
        ("type", DISPLAYCONFIG_DEVICE_INFO_TYPE),
        ("size", c_uint32),
        ("adapterId", LUID),
        ("id", c_uint32),
    ]


class DUMMYSTRUCTNAME_TARGET_DEVICE_NAME_FLAGS(Structure):
    _fields_ = [
        ("friendlyNameFromEdid", c_uint32, 1),
        ("friendlyNameForced", c_uint32, 1),
        ("edidIdsValid", c_uint32, 1),
        ("reserved", c_uint32, 29),
    ]


class DUMMYUNIONNAME_TARGET_DEVICE_NAME_FLAGS(Union):
    _fields_ = [
        ("DUMMYSTRUCTNAME", DUMMYSTRUCTNAME_TARGET_DEVICE_NAME_FLAGS),
        ("value", c_uint32),
    ]


class DISPLAYCONFIG_TARGET_DEVICE_NAME_FLAGS(Structure):
    _fields_ = [("DUMMYUNIONNAME", DUMMYUNIONNAME_TARGET_DEVICE_NAME_FLAGS)]


class DISPLAYCONFIG_TARGET_DEVICE_NAME(Structure):
    _fields_ = [
        ("header", DISPLAYCONFIG_DEVICE_INFO_HEADER),
        ("flags", DISPLAYCONFIG_TARGET_DEVICE_NAME_FLAGS),
        ("outputTechnology", DISPLAYCONFIG_VIDEO_OUTPUT_TECHNOLOGY),
        ("edidManufactureId", c_uint16),
        ("edidProductCodeId", c_uint16),
        ("connectorInstance", c_uint32),
        ("monitorFriendlyDeviceName", WCHAR * 64),
        ("monitorDevicePath", WCHAR * 128),
    ]


class DISPLAYCONFIG_ADAPTER_NAME(Structure):
    _fields_ = [
        ("header", DISPLAYCONFIG_DEVICE_INFO_HEADER),
        ("adapterDevicePath", WCHAR * 128),
    ]


class DISPLAYCONFIG_SOURCE_DEVICE_NAME(Structure):
    _fields_ = [
        ("header", DISPLAYCONFIG_DEVICE_INFO_HEADER),
        ("viewGdiDeviceName", WCHAR * 32),
    ]


class D3DKMT_HANDLE(c_uint):
    pass


class D3DKMT_OPENADAPTERFROMLUID(Structure):
    _fields_ = [("AdapterLuid", LUID), ("hAdapter", D3DKMT_HANDLE)]


class D3DKMT_CLOSEADAPTER(Structure):
    _fields_ = [("hAdapter", D3DKMT_HANDLE)]


class D3DDDI_VIDEO_PRESENT_SOURCE_ID(c_uint):
    pass


class DUMMYSTRUCTNAME_MULTIPLANE_OVERLAY_CAPS(Structure):
    _fields_ = [
        ("Rotation", c_uint, 1),
        ("RotationWithoutIndependentFlip", c_uint, 1),
        ("VerticalFlip", c_uint, 1),
        ("HorizontalFlip", c_uint, 1),
        ("StretchRGB", c_uint, 1),
        ("StretchYUV", c_uint, 1),
        ("BilinearFilter", c_uint, 1),
        ("HighFilter", c_uint, 1),
        ("Shared", c_uint, 1),
        ("Immediate", c_uint, 1),
        ("Plane0ForVirtualModeOnly", c_uint, 1),
        ("Version3DDISupport", c_uint, 1),
        ("Reserved", c_uint, 20),
    ]


class DUMMYUNIONNAME_MULTIPLANE_OVERLAY_CAPS(Union):
    _fields_ = [
        ("DUMMYSTRUCTNAME", DUMMYSTRUCTNAME_MULTIPLANE_OVERLAY_CAPS),
        ("Value", c_uint),
    ]


class D3DKMT_MULTIPLANE_OVERLAY_CAPS(Structure):
    _fields_ = [("DUMMYUNIONNAME", DUMMYUNIONNAME_MULTIPLANE_OVERLAY_CAPS)]


class D3DKMT_GET_MULTIPLANE_OVERLAY_CAPS(Structure):
    _fields_ = [
        ("hAdapter", D3DKMT_HANDLE),
        ("VidPnSourceId", D3DDDI_VIDEO_PRESENT_SOURCE_ID),
        ("MaxPlanes", c_uint),
        ("MaxRGBPlanes", c_uint),
        ("MaxYUVPlanes", c_uint),
        ("OverlayCaps", D3DKMT_MULTIPLANE_OVERLAY_CAPS),
        ("MaxStretchFactor", c_float),
        ("MaxShrinkFactor", c_float),
    ]


class DISPLAYCONFIG_TOPOLOGY_ID(c_uint32):
    DISPLAYCONFIG_TOPOLOGY_INTERNAL = 0x1
    DISPLAYCONFIG_TOPOLOGY_CLONE = 0x2
    DISPLAYCONFIG_TOPOLOGY_EXTEND = 0x4
    DISPLAYCONFIG_TOPOLOGY_EXTERNAL = 0x8
    DISPLAYCONFIG_TOPOLOGY_FORCE_UINT32 = 0xFFFFFFFF


class MPOCaps(TypedDict):
    Rotation: int
    RotationWithoutIndependentFlip: int
    VerticalFlip: int
    HorizontalFlip: int
    StretchRGB: int
    StretchYUV: int
    BilinearFilter: int
    HighFilter: int
    Shared: int
    Immediate: int
    Plane0ForVirtualModeOnly: int
    Version3DDISupport: int


class MPOCapabilities(TypedDict):
    MaxPlanes: int
    MaxRGBPlanes: int
    MaxYUVPlanes: int
    MaxStretchFactor: float
    MaxShrinkFactor: float
    caps: MPOCaps


class Display(TypedDict):
    monitorFriendlyDeviceName: str
    monitorDevicePath: str
    adapterDevicePath: str
    outputTechnology: int
    rotation: int
    refreshRate: float
    horizontalFrequency: float
    resolution: str
    pixelRate: int
    scaling: int
    pixelFormat: int
    mpo: MPOCapabilities


QDC_ONLY_ACTIVE_PATHS: Final = 0x2
ERROR_INSUFFICIENT_BUFFER: Final = 0x7A

user32 = windll.user32

GetDisplayConfigBufferSizes = user32.GetDisplayConfigBufferSizes
GetDisplayConfigBufferSizes.argtypes = [c_uint32, POINTER(c_uint32), POINTER(c_uint32)]
GetDisplayConfigBufferSizes.restype = LONG

QueryDisplayConfig = user32.QueryDisplayConfig
QueryDisplayConfig.argtypes = [
    c_uint32,
    POINTER(c_uint32),
    POINTER(DISPLAYCONFIG_PATH_INFO),
    POINTER(c_uint32),
    POINTER(DISPLAYCONFIG_MODE_INFO),
    POINTER(DISPLAYCONFIG_TOPOLOGY_ID),
]
QueryDisplayConfig.restype = LONG

DisplayConfigGetDeviceInfo = user32.DisplayConfigGetDeviceInfo
DisplayConfigGetDeviceInfo.argtypes = [POINTER(DISPLAYCONFIG_DEVICE_INFO_HEADER)]
DisplayConfigGetDeviceInfo.restype = LONG

gdi32 = windll.gdi32

D3DKMTOpenAdapterFromLuid = gdi32.D3DKMTOpenAdapterFromLuid
D3DKMTOpenAdapterFromLuid.argtypes = [POINTER(D3DKMT_OPENADAPTERFROMLUID)]
D3DKMTOpenAdapterFromLuid.restype = LONG

D3DKMTGetMultiPlaneOverlayCaps = gdi32.D3DKMTGetMultiPlaneOverlayCaps
D3DKMTGetMultiPlaneOverlayCaps.argtypes = [POINTER(D3DKMT_GET_MULTIPLANE_OVERLAY_CAPS)]
D3DKMTGetMultiPlaneOverlayCaps.restype = LONG

D3DKMTCloseAdapter = gdi32.D3DKMTCloseAdapter
D3DKMTCloseAdapter.argtypes = [POINTER(D3DKMT_CLOSEADAPTER)]
D3DKMTCloseAdapter.restype = LONG


def get_display_info():
    result = ERROR_INSUFFICIENT_BUFFER

    num_path_array_elements = c_uint32()
    num_mode_info_array_elements = c_uint32()

    # shut the linter up
    path_array = (DISPLAYCONFIG_PATH_INFO * num_path_array_elements.value)()
    mode_info_array = (DISPLAYCONFIG_MODE_INFO * num_mode_info_array_elements.value)()

    while result == ERROR_INSUFFICIENT_BUFFER:
        result = GetDisplayConfigBufferSizes(
            QDC_ONLY_ACTIVE_PATHS,
            byref(num_path_array_elements),
            byref(num_mode_info_array_elements),
        )

        if result != 0:
            raise WinError(result)

        path_array = (DISPLAYCONFIG_PATH_INFO * num_path_array_elements.value)()
        mode_info_array = (
            DISPLAYCONFIG_MODE_INFO * num_mode_info_array_elements.value
        )()

        result = QueryDisplayConfig(
            QDC_ONLY_ACTIVE_PATHS,
            byref(num_path_array_elements),
            path_array,
            byref(num_mode_info_array_elements),
            mode_info_array,
            None,
        )

    if result != 0:
        raise WinError(result)

    displays: List[Display] = []

    pixel_formats = {}
    horizontal_frequencies = {}
    pixel_rates = {}
    resolutions = {}

    for mode in mode_info_array:
        if (
            mode.infoType.value
            == DISPLAYCONFIG_MODE_INFO_TYPE.DISPLAYCONFIG_MODE_INFO_TYPE_SOURCE
        ):
            pixel_formats[mode.id] = mode.DUMMYUNIONNAME.sourceMode.pixelFormat.value
            resolutions[mode.id] = (
                f"{mode.DUMMYUNIONNAME.sourceMode.width} x {mode.DUMMYUNIONNAME.sourceMode.height}"
            )
        elif (
            mode.infoType.value
            == DISPLAYCONFIG_MODE_INFO_TYPE.DISPLAYCONFIG_MODE_INFO_TYPE_TARGET
        ):
            horizontal_frequencies[mode.id] = (
                mode.DUMMYUNIONNAME.targetMode.targetVideoSignalInfo.hSyncFreq.Numerator
                / mode.DUMMYUNIONNAME.targetMode.targetVideoSignalInfo.hSyncFreq.Denominator
            )
            pixel_rates[mode.id] = (
                mode.DUMMYUNIONNAME.targetMode.targetVideoSignalInfo.pixelRate
            )

    for path in path_array:
        target_name = DISPLAYCONFIG_TARGET_DEVICE_NAME()
        target_name.header.adapterId = path.targetInfo.adapterId
        target_name.header.id = path.targetInfo.id
        target_name.header.type = (
            DISPLAYCONFIG_DEVICE_INFO_TYPE.DISPLAYCONFIG_DEVICE_INFO_GET_TARGET_NAME
        )
        target_name.header.size = sizeof(target_name)
        result = DisplayConfigGetDeviceInfo(byref(target_name.header))
        if result != 0:
            raise WinError(result)

        adapter_name = DISPLAYCONFIG_ADAPTER_NAME()
        adapter_name.header.adapterId = path.targetInfo.adapterId
        adapter_name.header.type = (
            DISPLAYCONFIG_DEVICE_INFO_TYPE.DISPLAYCONFIG_DEVICE_INFO_GET_ADAPTER_NAME
        )
        adapter_name.header.size = sizeof(adapter_name)
        result = DisplayConfigGetDeviceInfo(byref(adapter_name.header))
        if result != 0:
            raise WinError(result)

        source_name = DISPLAYCONFIG_SOURCE_DEVICE_NAME()
        source_name.header.adapterId = path.sourceInfo.adapterId
        source_name.header.id = path.sourceInfo.id
        source_name.header.type = (
            DISPLAYCONFIG_DEVICE_INFO_TYPE.DISPLAYCONFIG_DEVICE_INFO_GET_SOURCE_NAME
        )
        source_name.header.size = sizeof(source_name)
        result = DisplayConfigGetDeviceInfo(byref(source_name.header))
        if result != 0:
            raise WinError(result)

        open_adapter = D3DKMT_OPENADAPTERFROMLUID()
        open_adapter.AdapterLuid = adapter_name.header.adapterId
        result = D3DKMTOpenAdapterFromLuid(byref(open_adapter))
        if result != 0:
            raise WinError(result)

        caps = D3DKMT_GET_MULTIPLANE_OVERLAY_CAPS()
        caps.hAdapter = open_adapter.hAdapter
        caps.VidPnSourceId = path.sourceInfo.id
        result = D3DKMTGetMultiPlaneOverlayCaps(byref(caps))
        if result != 0:
            raise WinError(result)

        displays.append(
            {
                "monitorFriendlyDeviceName": target_name.monitorFriendlyDeviceName,
                "monitorDevicePath": target_name.monitorDevicePath,
                "adapterDevicePath": adapter_name.adapterDevicePath,
                "outputTechnology": path.targetInfo.outputTechnology.value,
                "rotation": path.targetInfo.rotation.value,
                "refreshRate": path.targetInfo.refreshRate.Numerator
                / path.targetInfo.refreshRate.Denominator,
                "horizontalFrequency": horizontal_frequencies[path.targetInfo.id],
                "resolution": resolutions[path.sourceInfo.id],
                "pixelRate": pixel_rates[path.targetInfo.id],
                "scaling": path.targetInfo.scaling.value,
                "pixelFormat": pixel_formats[path.sourceInfo.id],
                "mpo": {
                    "MaxPlanes": caps.MaxPlanes,
                    "MaxRGBPlanes": caps.MaxRGBPlanes,
                    "MaxYUVPlanes": caps.MaxYUVPlanes,
                    "MaxStretchFactor": caps.MaxStretchFactor,
                    "MaxShrinkFactor": caps.MaxShrinkFactor,
                    "caps": {
                        "Rotation": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.Rotation,
                        "RotationWithoutIndependentFlip": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.RotationWithoutIndependentFlip,
                        "VerticalFlip": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.VerticalFlip,
                        "HorizontalFlip": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.HorizontalFlip,
                        "StretchRGB": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.StretchRGB,
                        "StretchYUV": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.StretchYUV,
                        "BilinearFilter": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.BilinearFilter,
                        "HighFilter": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.HighFilter,
                        "Shared": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.Shared,
                        "Immediate": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.Immediate,
                        "Plane0ForVirtualModeOnly": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.Plane0ForVirtualModeOnly,
                        "Version3DDISupport": caps.OverlayCaps.DUMMYUNIONNAME.DUMMYSTRUCTNAME.Version3DDISupport,
                    },
                },
            }
        )

        close_adapter = D3DKMT_CLOSEADAPTER()
        close_adapter.hAdapter = open_adapter.hAdapter
        result = D3DKMTCloseAdapter(byref(close_adapter))
        if result != 0:
            raise WinError(result)

    return {"displays": displays}
