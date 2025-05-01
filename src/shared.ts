export const enum REGISTRY_DATA_TYPES {
  REG_NONE = 0,
  REG_SZ = 1,
  REG_EXPAND_SZ = 2,
  REG_BINARY = 3,
  REG_DWORD = 4,
  REG_DWORD_BIG_ENDIAN = 5,
  REG_LINK = 6,
  REG_MULTI_SZ = 7,
  REG_RESOURCE_LIST = 8,
  REG_FULL_RESOURCE_DESCRIPTOR = 9,
  REG_RESOURCE_REQUIREMENTS_LIST = 10,
  REG_QWORD = 11,
}

export function formatRegValue(name: string, value: number | null) {
  if (value !== null) {
    return `"${name}"=dword:${value.toString(16).padStart(8, "0")}\n`;
  } else {
    return `"${name}"=-\n`;
  }
}

export function formatBitMask(value: number | null, isReg: boolean) {
  if (value !== null) {
    const hexString = value.toString(16).padStart(16, "0");

    const bytes: string[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(hexString.slice(i, i + 2));
    }

    return isReg
      ? `"hex:${bytes.reverse().join(",")}"`
      : bytes.reverse().join("");
  } else {
    return "-";
  }
}
