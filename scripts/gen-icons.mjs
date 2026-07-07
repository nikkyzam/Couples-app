// Generates PNG app icons with no external deps — draws a heart on the brand
// gradient and encodes a real PNG via zlib. Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

// Brand: plum-950 (#1a0d22) -> plum-600 (#7e40a0), heart in ember (#f83a63).
const bgTop = [42, 22, 54]
const bgBot = [26, 13, 34]
const heartCol = [248, 58, 99]

function heartField(nx, ny) {
  // Classic heart implicit curve. ny is image-space (down = +), so flip for
  // lobes-up. Point sits at the bottom.
  const x = nx
  const y = -ny
  const a = x * x + y * y - 1
  return a * a * a - x * x * y * y * y
}

function makePng(size, path) {
  const bytesPerRow = size * 4
  const raw = Buffer.alloc((bytesPerRow + 1) * size)

  for (let y = 0; y < size; y++) {
    raw[y * (bytesPerRow + 1)] = 0 // filter: none
    const t = y / (size - 1)
    for (let x = 0; x < size; x++) {
      const off = y * (bytesPerRow + 1) + 1 + x * 4
      let r = lerp(bgTop[0], bgBot[0], t)
      let g = lerp(bgTop[1], bgBot[1], t)
      let b = lerp(bgTop[2], bgBot[2], t)

      // Heart, centered (nudged down since the shape is top-heavy).
      const nx = ((x / size) * 2 - 1) / 0.66
      const ny = ((y / size) * 2 - 1 + 0.12) / 0.66
      const f = heartField(nx, ny)
      // Crisp fill with a thin antialiased edge.
      const edge = Math.min(1, Math.max(0, 0.5 - f * (size * 0.9)))
      if (edge > 0) {
        r = lerp(r, heartCol[0], edge)
        g = lerp(g, heartCol[1], edge)
        b = lerp(b, heartCol[2], edge)
      }

      raw[off] = r
      raw[off + 1] = g
      raw[off + 2] = b
      raw[off + 3] = 255
    }
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeBuf = Buffer.from(type, 'ascii')
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const idat = deflateSync(raw)
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
  console.log('wrote', path, png.length, 'bytes')
}

// CRC32 for PNG chunks.
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return c ^ 0xffffffff
}

mkdirSync('public', { recursive: true })
makePng(192, 'public/icon-192.png')
makePng(512, 'public/icon-512.png')
