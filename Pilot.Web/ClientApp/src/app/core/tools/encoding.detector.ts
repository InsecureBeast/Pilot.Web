
export class EncodingDetector {

  isUtf8(data: Uint8Array): boolean {
    var i = 0;
    var len = data && data.length;
    var b;

    for (; i < len; i++) {
      b = data[i];
      if (b > 0xFF) {
        return false;
      }

      if (b === 0x09 || b === 0x0A || b === 0x0D ||
          (b >= 0x20 && b <= 0x7E)) {
        continue;
      }

      if (b >= 0xC2 && b <= 0xDF) {
        if (i + 1 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xBF) {
          return false;
        }
        i++;
      } else if (b === 0xE0) {
        if (i + 2 >= len ||
            data[i + 1] < 0xA0 || data[i + 1] > 0xBF ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
          return false;
        }
        i += 2;
      } else if ((b >= 0xE1 && b <= 0xEC) ||
                  b === 0xEE || b === 0xEF) {
        if (i + 2 >= len ||
            data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
          return false;
        }
        i += 2;
      } else if (b === 0xED) {
        if (i + 2 >= len ||
            data[i + 1] < 0x80 || data[i + 1] > 0x9F ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
          return false;
        }
        i += 2;
      } else if (b === 0xF0) {
        if (i + 3 >= len ||
            data[i + 1] < 0x90 || data[i + 1] > 0xBF ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
            data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
          return false;
        }
        i += 3;
      } else if (b >= 0xF1 && b <= 0xF3) {
        if (i + 3 >= len ||
            data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
            data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
          return false;
        }
        i += 3;
      } else if (b === 0xF4) {
        if (i + 3 >= len ||
            data[i + 1] < 0x80 || data[i + 1] > 0x8F ||
            data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
            data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
          return false;
        }
        i += 3;
      } else {
        return false;
      }
    }

    return true;
  }

  // utf-16 (LE or BE)
  isUtf16(data: Uint8Array): boolean {
    var i = 0;
    var len = data && data.length;
    var pos = null;
    var b1, b2, next, prev;

    if (len < 2) {
      if (data[0] > 0xFF) {
        return false;
      }
    } else {
      b1 = data[0];
      b2 = data[1];
      if (b1 === 0xFF && // BOM (little-endian)
          b2 === 0xFE) {
        return true;
      }
      if (b1 === 0xFE && // BOM (big-endian)
          b2 === 0xFF) {
        return true;
      }

      for (; i < len; i++) {
        if (data[i] === 0x00) {
          pos = i;
          break;
        } else if (data[i] > 0xFF) {
          return false;
        }
      }

      if (pos === null) {
        return false; // Non ASCII
      }

      next = data[pos + 1]; // BE
      if (next !== void 0 && next > 0x00 && next < 0x80) {
        return true;
      }

      prev = data[pos - 1]; // LE
      if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
        return true;
      }
    }

    return false;
  }
}