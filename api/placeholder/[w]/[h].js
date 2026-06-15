/** Vercel — /api/placeholder/:w/:h SVG 플레이스홀더 */
export default function handler(req, res) {
  const width = Math.min(512, Math.max(1, Number(req.query.w) || 40));
  const height = Math.min(512, Math.max(1, Number(req.query.h) || 40));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#2a2a2a"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">?</text>
</svg>`;
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(svg);
}
