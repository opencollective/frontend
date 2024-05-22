import path from 'path';

// next.js export
// ts-unused-exports:disable-next-line
export default function handler(req, res) {
  const color = req.query.color === 'blue' ? 'blue' : 'white';
  const verb = ['donate', 'contribute'].includes(req.query.verb) ? req.query.verb : 'contribute';
  const size = req.query.size === '@2x' ? req.query.size : '';
  res.set('Cache-Control', `public, max-age=86400`);
  res.sendFile(path.join(process.cwd(), `public/static/images/buttons/${verb}-button-${color}${size}.png`));
}
