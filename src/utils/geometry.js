export function distancePointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    const ddx = px - x1;
    const ddy = py - y1;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }

  const t =
    ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));

  const projX = x1 + clampedT * dx;
  const projY = y1 + clampedT * dy;

  const ddx = px - projX;
  const ddy = py - projY;
  return {
    distance: Math.sqrt(ddx * ddx + ddy * ddy),
    t: clampedT,
    point: { x: projX, y: projY },
  };
}

export function wallLength(wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pointOnWallAtOffset(wall, offset) {
  const clamped = Math.max(0, Math.min(1, offset));
  const x = wall.x1 + (wall.x2 - wall.x1) * clamped;
  const y = wall.y1 + (wall.y2 - wall.y1) * clamped;
  return { x, y };
}

export function wallAngleDeg(wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const rad = Math.atan2(dy, dx);
  return (rad * 180) / Math.PI;
}

