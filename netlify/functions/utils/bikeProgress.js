// Schema reference: zoffline/zwift-offline protobuf/user_storage.proto.
// Decode only bike progress; skip other attributes and unknown fields.
import { TextDecoder } from 'node:util';

function* fields(bytes) {
  let offset = 0;
  const take = (length) => {
    if (!Number.isSafeInteger(length) || length < 0 || length > bytes.length - offset) {
      throw new Error('Truncated protobuf');
    }
    const value = bytes.subarray(offset, offset + length);
    offset += length;
    return value;
  };
  const varint = () => {
    let value = 0n;
    for (let i = 0; i < 10; i++) {
      const byte = take(1)[0];
      if (i === 9 && byte > 1) throw new Error('Invalid varint');
      value |= BigInt(byte & 127) << BigInt(i * 7);
      if (!(byte & 128)) return value;
    }
    throw new Error('Invalid varint');
  };
  while (offset < bytes.length) {
    const tag = varint();
    if (tag > 0xffffffffn || tag < 8n) throw new Error('Invalid field tag');
    const number = Number(tag >> 3n);
    const wire = Number(tag & 7n);
    let value;
    if (wire === 0) value = varint();
    else if (wire === 1) value = take(8);
    else if (wire === 2) value = take(Number(varint()));
    else if (wire === 5) value = take(4);
    else throw new Error('Unsupported wire type');
    yield { number, wire, value };
  }
}

function scalar(field, expectedWire) {
  if (field.wire !== expectedWire) throw new Error('Unexpected field type');
  if (expectedWire === 0) {
    return field.value <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(field.value) : field.value.toString();
  }
  if (expectedWire === 2) return new TextDecoder('utf-8', { fatal: true }).decode(field.value);
  const value = new DataView(field.value.buffer, field.value.byteOffset, 4).getFloat32(0, true);
  if (!Number.isFinite(value)) throw new Error('Invalid progress value');
  return value;
}

function upgrade(bytes) {
  const result = {};
  const names = { 1: 'time', 2: 'level', 3: 'price' };
  for (const field of fields(bytes)) {
    if (names[field.number]) result[names[field.number]] = scalar(field, 0);
  }
  return result;
}

function bike(bytes) {
  const result = { upgrades: [] };
  const floats = {
    3: 'levelDistance', 4: 'totalDistance',
    5: 'levelElevation', 6: 'totalElevation',
    7: 'levelMovingTime', 8: 'totalMovingTime', 15: 'percentage',
  };
  for (const field of fields(bytes)) {
    if (field.number === 1) result.signature = scalar(field, 2);
    else if (field.number === 2) result.level = scalar(field, 0);
    else if (field.number === 10) result.lastUpgrade = scalar(field, 0);
    else if (field.number === 11) result.time = scalar(field, 0);
    else if (floats[field.number]) result[floats[field.number]] = scalar(field, 5);
    else if (field.number === 12) {
      if (field.wire !== 2) throw new Error('Invalid upgrade message');
      result.upgrades.push(upgrade(field.value));
    }
  }
  if (!result.signature) throw new Error('Missing bike signature');
  return result;
}

export function decodeBikeProgress(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length > 1024 * 1024) throw new Error('Response too large');
  const bikes = [];
  for (const attribute of fields(bytes)) {
    if (attribute.number !== 2) continue;
    if (attribute.wire !== 2) throw new Error('Invalid attribute message');
    for (const field of fields(attribute.value)) {
      if (field.number !== 24) continue;
      if (field.wire !== 2) throw new Error('Invalid bike message');
      bikes.push(bike(field.value));
    }
  }
  return bikes;
}
