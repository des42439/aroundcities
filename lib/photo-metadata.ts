export type PhotoMetadata = {
  capturedAt: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ExifValue =
  | string
  | number
  | number[]
  | [number, number][];

const EMPTY_METADATA: PhotoMetadata = {
  capturedAt: null,
  latitude: null,
  longitude: null,
};

const TYPE_BYTE_COUNTS: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

export async function extractPhotoMetadata(
  file: File
): Promise<PhotoMetadata> {
  if (!file.type.includes("jpeg") && !/\.(jpe?g)$/i.test(file.name)) {
    return EMPTY_METADATA;
  }

  try {
    return parseExifMetadata(await file.arrayBuffer());
  } catch {
    return EMPTY_METADATA;
  }
}

function parseExifMetadata(buffer: ArrayBuffer): PhotoMetadata {
  const view = new DataView(buffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return EMPTY_METADATA;
  }

  let offset = 2;

  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      return EMPTY_METADATA;
    }

    const marker = view.getUint8(offset + 1);
    const segmentLength = view.getUint16(offset + 2);
    const segmentStart = offset + 4;

    if (
      marker === 0xe1 &&
      segmentStart + segmentLength - 2 <= view.byteLength &&
      readAscii(view, segmentStart, 6) === "Exif\0\0"
    ) {
      return parseTiff(view, segmentStart + 6);
    }

    offset = segmentStart + segmentLength - 2;
  }

  return EMPTY_METADATA;
}

function parseTiff(view: DataView, tiffStart: number): PhotoMetadata {
  const endian = readAscii(view, tiffStart, 2);
  const littleEndian =
    endian === "II" ? true : endian === "MM" ? false : null;

  if (littleEndian === null) {
    return EMPTY_METADATA;
  }

  const firstIfdOffset = readUint32(
    view,
    tiffStart + 4,
    littleEndian
  );
  const firstIfd = readIfd(
    view,
    tiffStart,
    tiffStart + firstIfdOffset,
    littleEndian
  );
  const exifIfdOffset = firstIfd.get(0x8769);
  const gpsIfdOffset = firstIfd.get(0x8825);
  const exifIfd =
    typeof exifIfdOffset === "number"
      ? readIfd(
          view,
          tiffStart,
          tiffStart + exifIfdOffset,
          littleEndian
        )
      : new Map<number, ExifValue>();
  const gpsIfd =
    typeof gpsIfdOffset === "number"
      ? readIfd(
          view,
          tiffStart,
          tiffStart + gpsIfdOffset,
          littleEndian
        )
      : new Map<number, ExifValue>();

  return {
    capturedAt: parseExifDate(
      exifIfd.get(0x9003) ??
        exifIfd.get(0x9004) ??
        firstIfd.get(0x0132)
    ),
    ...parseGps(gpsIfd),
  };
}

function readIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean
) {
  const entries = new Map<number, ExifValue>();

  if (ifdOffset < 0 || ifdOffset + 2 > view.byteLength) {
    return entries;
  }

  const count = readUint16(view, ifdOffset, littleEndian);

  for (let index = 0; index < count; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;

    if (entryOffset + 12 > view.byteLength) {
      break;
    }

    const tag = readUint16(view, entryOffset, littleEndian);
    const type = readUint16(view, entryOffset + 2, littleEndian);
    const itemCount = readUint32(view, entryOffset + 4, littleEndian);
    const byteCount = (TYPE_BYTE_COUNTS[type] ?? 0) * itemCount;
    const valueOffset =
      byteCount <= 4
        ? entryOffset + 8
        : tiffStart + readUint32(view, entryOffset + 8, littleEndian);

    const value = readExifValue(
      view,
      valueOffset,
      type,
      itemCount,
      littleEndian
    );

    if (value !== null) {
      entries.set(tag, value);
    }
  }

  return entries;
}

function readExifValue(
  view: DataView,
  offset: number,
  type: number,
  count: number,
  littleEndian: boolean
): ExifValue | null {
  if (offset < 0 || offset >= view.byteLength) {
    return null;
  }

  if (type === 2) {
    return readAscii(view, offset, count).replace(/\0+$/, "");
  }

  if (type === 3) {
    const values = Array.from({ length: count }, (_, index) =>
      readUint16(view, offset + index * 2, littleEndian)
    );

    return values.length === 1 ? values[0] : values;
  }

  if (type === 4) {
    const values = Array.from({ length: count }, (_, index) =>
      readUint32(view, offset + index * 4, littleEndian)
    );

    return values.length === 1 ? values[0] : values;
  }

  if (type === 5) {
    return Array.from(
      { length: count },
      (_, index): [number, number] => [
        readUint32(view, offset + index * 8, littleEndian),
        readUint32(view, offset + index * 8 + 4, littleEndian),
      ]
    );
  }

  return null;
}

function parseExifDate(value: ExifValue | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(
    /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`;
}

function parseGps(gpsIfd: Map<number, ExifValue>) {
  const latitudeRef = gpsIfd.get(0x0001);
  const latitudeValue = gpsIfd.get(0x0002);
  const longitudeRef = gpsIfd.get(0x0003);
  const longitudeValue = gpsIfd.get(0x0004);
  const latitude = rationalDmsToDecimal(latitudeValue);
  const longitude = rationalDmsToDecimal(longitudeValue);

  return {
    latitude:
      latitude === null
        ? null
        : latitudeRef === "S"
          ? -latitude
          : latitude,
    longitude:
      longitude === null
        ? null
        : longitudeRef === "W"
          ? -longitude
          : longitude,
  };
}

function rationalDmsToDecimal(value: ExifValue | undefined) {
  if (!Array.isArray(value) || value.length < 3) {
    return null;
  }

  const [degrees, minutes, seconds] = value.map((item) => {
    if (!Array.isArray(item) || item.length !== 2 || item[1] === 0) {
      return null;
    }

    return item[0] / item[1];
  });

  if (degrees === null || minutes === null || seconds === null) {
    return null;
  }

  return degrees + minutes / 60 + seconds / 3600;
}

function readAscii(view: DataView, offset: number, length: number) {
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(view.getUint8(offset + index));
  }

  return value;
}

function readUint16(
  view: DataView,
  offset: number,
  littleEndian: boolean
) {
  return view.getUint16(offset, littleEndian);
}

function readUint32(
  view: DataView,
  offset: number,
  littleEndian: boolean
) {
  return view.getUint32(offset, littleEndian);
}
