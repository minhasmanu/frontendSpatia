export function snapToGrid(x, y, gridSize = 10) {
  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;
  return { x: snappedX, y: snappedY };
}

export function snapLineToGrid(line, gridSize = 10) {
  const p1 = snapToGrid(line.x1, line.y1, gridSize);
  const p2 = snapToGrid(line.x2, line.y2, gridSize);
  return { ...line, ...p1, x2: p2.x, y2: p2.y };
}

