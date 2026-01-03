export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: "Gannon's Quest API is operational.",
    timestamp: new Date().toISOString()
  });
}
