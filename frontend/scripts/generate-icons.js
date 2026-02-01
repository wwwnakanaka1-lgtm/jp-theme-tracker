const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using raw PNG bytes
// This creates a basic solid color icon with "JT" text (represented as a solid square for simplicity)

function createPNG(width, height) {
  // PNG header and IHDR chunk
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);  // Width
  ihdrData.writeUInt32BE(height, 4); // Height
  ihdrData.writeUInt8(8, 8);         // Bit depth
  ihdrData.writeUInt8(2, 9);         // Color type (2 = RGB)
  ihdrData.writeUInt8(0, 10);        // Compression method
  ihdrData.writeUInt8(0, 11);        // Filter method
  ihdrData.writeUInt8(0, 12);        // Interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Create raw image data (RGB)
  const rawData = [];

  // Background color: #1f2937 (gray-800)
  const bgR = 0x1f, bgG = 0x29, bgB = 0x37;
  // Accent color: #3b82f6 (blue-500)
  const acR = 0x3b, acG = 0x82, acB = 0xf6;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte for each row
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Inner circle - blue accent
        rawData.push(acR, acG, acB);
      } else {
        // Background - dark gray
        rawData.push(bgR, bgG, bgB);
      }
    }
  }

  // Compress raw data using zlib
  const zlib = require('zlib');
  const rawBuffer = Buffer.from(rawData);
  const compressedData = zlib.deflateSync(rawBuffer);

  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation for PNG
function crc32(data) {
  let crc = 0xffffffff;
  const table = makeCrcTable();

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return crc ^ 0xffffffff;
}

function makeCrcTable() {
  const table = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

const sizes = [192, 512];

sizes.forEach(size => {
  const png = createPNG(size, size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created: ${filename}`);
});

console.log('Icons generated successfully!');
