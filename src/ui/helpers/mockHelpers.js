export function sendJson(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}