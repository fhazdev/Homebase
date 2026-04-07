/**
 * Generate PWA icon PNGs from SVG.
 * Run: node scripts/generate-icons.mjs
 *
 * This creates minimal valid PNG files for PWA install support.
 * For production, replace these with properly designed icons.
 */

import { writeFileSync } from 'fs'

// Minimal PNG generator — creates a solid-color square with embedded text
function createPng(size) {
  // We'll create an uncompressed PNG with a solid background
  const channels = 4 // RGBA
  const rowSize = size * channels + 1 // +1 for filter byte
  const dataSize = rowSize * size

  // Colors
  const bg = [0x13, 0x16, 0x17, 0xFF] // #131617
  const accent = [0xc8, 0xf5, 0x40, 0xFF] // #c8f540

  // Build raw pixel data with filter bytes
  const rawData = Buffer.alloc(dataSize)
  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0 // None filter
    for (let x = 0; x < size; x++) {
      const offset = y * rowSize + 1 + x * channels
      // Draw rounded rect with house emoji placeholder as a simple "H"
      const margin = Math.floor(size * 0.05)
      const isInside = x >= margin && x < size - margin && y >= margin && y < size - margin

      // Simple "H" letter in center
      const cx = size / 2
      const cy = size / 2
      const letterW = size * 0.35
      const letterH = size * 0.45
      const strokeW = size * 0.08

      const inLeftBar = x >= cx - letterW/2 && x <= cx - letterW/2 + strokeW &&
                        y >= cy - letterH/2 && y <= cy + letterH/2
      const inRightBar = x >= cx + letterW/2 - strokeW && x <= cx + letterW/2 &&
                         y >= cy - letterH/2 && y <= cy + letterH/2
      const inMiddle = x >= cx - letterW/2 && x <= cx + letterW/2 &&
                       y >= cy - strokeW/2 && y <= cy + strokeW/2

      const isLetter = inLeftBar || inRightBar || inMiddle

      const color = !isInside ? [0, 0, 0, 0] : isLetter ? accent : bg
      rawData[offset] = color[0]
      rawData[offset + 1] = color[1]
      rawData[offset + 2] = color[2]
      rawData[offset + 3] = color[3]
    }
  }

  // Deflate raw data (store method — no compression, just valid zlib)
  const deflated = zlibStore(rawData)

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const chunks = [
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0)),
  ]

  return Buffer.concat([signature, ...chunks])
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeB = Buffer.from(type, 'ascii')
  const crc = crc32(Buffer.concat([typeB, data]))
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crc >>> 0, 0)
  return Buffer.concat([len, typeB, data, crcB])
}

function zlibStore(data) {
  // zlib header (no compression)
  const header = Buffer.from([0x78, 0x01])
  const blocks = []
  const BLOCK_SIZE = 65535
  for (let i = 0; i < data.length; i += BLOCK_SIZE) {
    const block = data.subarray(i, Math.min(i + BLOCK_SIZE, data.length))
    const isLast = i + BLOCK_SIZE >= data.length
    const blockHeader = Buffer.alloc(5)
    blockHeader[0] = isLast ? 1 : 0
    blockHeader.writeUInt16LE(block.length, 1)
    blockHeader.writeUInt16LE(block.length ^ 0xFFFF, 3)
    blocks.push(blockHeader, block)
  }
  // Adler32 checksum
  const adler = adler32(data)
  const adlerB = Buffer.alloc(4)
  adlerB.writeUInt32BE(adler >>> 0, 0)
  return Buffer.concat([header, ...blocks, adlerB])
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function adler32(buf) {
  let a = 1, b = 0
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521
    b = (b + a) % 65521
  }
  return ((b << 16) | a) >>> 0
}

// Generate icons
for (const size of [192, 512]) {
  const png = createPng(size)
  writeFileSync(`public/icons/icon-${size}.png`, png)
  console.log(`Generated icon-${size}.png (${png.length} bytes)`)
}
