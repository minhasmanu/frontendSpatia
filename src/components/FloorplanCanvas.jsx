import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Image as KImage, Group, Circle } from 'react-konva';
import windowSrc from '../assets/window.png';
import doorSrc from '../assets/door.png';
import { useFloorplanStore } from '../store/floorplanStore';
import { distancePointToSegment, pointOnWallAtOffset, wallAngleDeg, wallLength } from '../utils/geometry';
import { snapToGrid } from '../utils/snapping';
import './FloorplanCanvas.css';

const GRID_SIZE = 10;
const GRID_COLOR = '#e0e0e0';

export default function FloorplanCanvas({ onStageReady }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState(null);
  const [wallStart, setWallStart] = useState(null);
  const [previewWall, setPreviewWall] = useState(null);

  const {
    tool,
    walls,
    doors,
    windows,
    selected,
    setSelected,
    addWall,
    addDoor,
    addWindow,
    updateWall,
    updateDoor,
    updateWindow,
    deleteSelected,
    zoom,
    offset,
    setZoom,
    setOffset,
    zoomBy,
    panBy,
    snapPoint,
  } = useFloorplanStore();

  const [windowImg, setWindowImg] = useState(null);

  const [doorImg, setDoorImg] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = windowSrc;
    img.onload = () => setWindowImg(img);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = doorSrc;
    img.onload = () => setDoorImg(img);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth,
        height: clientHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (onStageReady && stageRef.current) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady]);

  const toWorldCoords = (stagePoint) => {
    const x = (stagePoint.x - offset.x) / zoom;
    const y = (stagePoint.y - offset.y) / zoom;
    return { x, y };
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const scaleBy = 1.05;
    const factor = direction > 0 ? 1 / scaleBy : scaleBy;

    zoomBy(factor, pointer);
  };

  const handleMouseDown = (e) => {
    const isMiddleButton = e.evt.button === 1;
    const isSpacePanning = e.evt.buttons === 1 && e.evt.shiftKey;

    if (isMiddleButton || isSpacePanning) {
      setIsPanning(true);
      setLastPanPos({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const world = toWorldCoords(pointer);
    const snapped = snapPoint(world.x, world.y);

    if (tool === 'wall') {
      if (!wallStart) {
        setWallStart(snapped);
      } else {
        if (snapped.x === wallStart.x && snapped.y === wallStart.y) {
          setWallStart(null);
          setPreviewWall(null);
          return;
        }
        addWall({
          x1: wallStart.x,
          y1: wallStart.y,
          x2: snapped.x,
          y2: snapped.y,
          thickness: 8,
        });
        setWallStart(snapped);
        setPreviewWall(null);
      }
      return;
    }

    if (tool === 'door' || tool === 'window') {
      if (!walls.length) return;

      let best = null;
      walls.forEach((wall) => {
        const result = distancePointToSegment(
          world.x,
          world.y,
          wall.x1,
          wall.y1,
          wall.x2,
          wall.y2
        );
        if (!best || result.distance < best.distance) {
          best = { wall, result };
        }
      });

      if (best && best.result.distance <= 20) {
        const offsetOnWall = best.result.t;
        const wallLen = wallLength(best.wall);
        const defaultWidth = Math.min(80, wallLen * 0.3);

        if (tool === 'door') {
          addDoor({
            wallId: best.wall.id,
            offset: offsetOnWall,
            width: defaultWidth,
          });
        } else {
          addWindow({
            wallId: best.wall.id,
            offset: offsetOnWall,
            width: defaultWidth,
          });
        }
      }
      return;
    }

    if (tool === 'delete') {
      if (selected) {
        deleteSelected();
      }
      return;
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && lastPanPos) {
      const dx = e.evt.clientX - lastPanPos.x;
      const dy = e.evt.clientY - lastPanPos.y;
      panBy(dx, dy);
      setLastPanPos({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }

    if (tool === 'wall' && wallStart) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      const world = toWorldCoords(pointer);
      const snapped = snapPoint(world.x, world.y);

      setPreviewWall({
        x1: wallStart.x,
        y1: wallStart.y,
        x2: snapped.x,
        y2: snapped.y,
        thickness: 8,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPos(null);
    }
  };

  const handleStageClick = (e) => {
    const target = e.target;
    const meta = target.getAttr('meta');

    if (!meta) {
      if (tool === 'select') {
        setSelected(null);
      }
      return;
    }

    if (tool === 'select') {
      setSelected({ type: meta.type, id: meta.id });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  const handleWallDragEnd = (wall, evt) => {
    const { x: dx, y: dy } = evt.target.position();
    const snappedStart = snapToGrid(wall.x1 + dx, wall.y1 + dy, GRID_SIZE);
    const snappedEnd = snapToGrid(wall.x2 + dx, wall.y2 + dy, GRID_SIZE);

    updateWall(wall.id, {
      x1: snappedStart.x,
      y1: snappedStart.y,
      x2: snappedEnd.x,
      y2: snappedEnd.y,
    });

    evt.target.position({ x: 0, y: 0 });
  };

  const handleWallHandleDragEnd = (wall, handle, evt) => {
    const stagePoint = evt.target.absolutePosition();
    const world = toWorldCoords(stagePoint);
    const snapped = snapToGrid(world.x, world.y, GRID_SIZE);

    if (handle === 'start') {
      updateWall(wall.id, {
        x1: snapped.x,
        y1: snapped.y,
      });
    } else {
      updateWall(wall.id, {
        x2: snapped.x,
        y2: snapped.y,
      });
    }
  };

  const handleOpeningDragEnd = (type, opening, wall, evt) => {
    if (!wall) return;
    const stagePoint = evt.target.absolutePosition();
    const world = toWorldCoords(stagePoint);

    const { t } = distancePointToSegment(
      world.x,
      world.y,
      wall.x1,
      wall.y1,
      wall.x2,
      wall.y2
    );

    const clamped = Math.max(0, Math.min(1, t));

    if (type === 'door') {
      updateDoor(opening.id, { offset: clamped });
    } else {
      updateWindow(opening.id, { offset: clamped });
    }
  };

  const renderGrid = () => {
    const { width, height } = dimensions;
    const lines = [];

    for (let x = 0; x <= width / zoom; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height / zoom]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    for (let y = 0; y <= height / zoom; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width / zoom, y]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
          listening={false}
        />
      );
    }

    return (
      <Group name="gridLines" listening={false}>
        {lines}
      </Group>
    );
  };

  const renderWalls = () =>
    walls.map((wall) => {
      const isSelected =
        selected && selected.type === 'wall' && selected.id === wall.id;

      // collect openings (doors + windows) on this wall
      const openings = [
        ...doors.filter((d) => d.wallId === wall.id).map((o) => ({ ...o, kind: 'door' })),
        ...windows.filter((w) => w.wallId === wall.id).map((o) => ({ ...o, kind: 'window' })),
      ];

      const wallLen = wallLength(wall);
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;

      // sort openings by offset along the wall
      openings.sort((a, b) => a.offset - b.offset);

      // build visible segments (exclude opening ranges)
      const segments = [];
      let curT = 0;

      openings.forEach((op) => {
        const halfT = Math.min(1, (op.width || 0) / Math.max(1e-6, wallLen) / 2);
        const tStart = Math.max(0, op.offset - halfT);
        const tEnd = Math.min(1, op.offset + halfT);

        if (tStart > curT + 1e-6) {
          segments.push([curT, tStart]);
        }

        curT = Math.max(curT, tEnd);
      });

      if (curT < 1 - 1e-6) {
        segments.push([curT, 1]);
      }

      return (
        <Group key={wall.id} draggable={tool === 'select'} onDragEnd={(evt) => handleWallDragEnd(wall, evt)} meta={{ type: 'wall', id: wall.id }}>
          {segments.map((seg, i) => {
            const [tA, tB] = seg;
            const xA = wall.x1 + dx * tA;
            const yA = wall.y1 + dy * tA;
            const xB = wall.x1 + dx * tB;
            const yB = wall.y1 + dy * tB;

            return (
              <Line
                key={`${wall.id}-seg-${i}`}
                points={[xA, yA, xB, yB]}
                stroke="#111"
                strokeWidth={wall.thickness}
                lineCap="square"
                lineJoin="miter"
                meta={{ type: 'wall', id: wall.id }}
              />
            );
          })}

          {isSelected && (
            <>
              <Circle
                x={wall.x1}
                y={wall.y1}
                radius={8}
                fill="#ffffff"
                stroke="#007bff"
                strokeWidth={2}
                draggable
                onDragEnd={(evt) =>
                  handleWallHandleDragEnd(wall, 'start', evt)
                }
              />
              <Circle
                x={wall.x2}
                y={wall.y2}
                radius={8}
                fill="#ffffff"
                stroke="#007bff"
                strokeWidth={2}
                draggable
                onDragEnd={(evt) => handleWallHandleDragEnd(wall, 'end', evt)}
              />
            </>
          )}
        </Group>
      );
    });

  const renderOpenings = (type) => {
    const collection = type === 'door' ? doors : windows;

    return collection.map((opening) => {
      const wall = walls.find((w) => w.id === opening.wallId);
      if (!wall) return null;

      const isSelected =
        selected && selected.type === type && selected.id === opening.id;

      const center = pointOnWallAtOffset(wall, opening.offset);
      const angle = wallAngleDeg(wall);
      const len = opening.width;
      const thickness = type === 'door' ? 14 : 10;

      // compute door image height to preserve aspect ratio when rendering
      let doorRenderHeight = thickness;
      if (type === 'door' && doorImg) {
        const imgW = doorImg.width || doorImg.naturalWidth || 1;
        const imgH = doorImg.height || doorImg.naturalHeight || 1;
        doorRenderHeight = (imgH / imgW) * len;
      }

      return (
        <Group
          key={opening.id}
          x={center.x}
          y={center.y}
          rotation={angle}
          draggable={tool === 'select'}
          onDragEnd={(evt) => handleOpeningDragEnd(type, opening, wall, evt)}
          meta={{ type, id: opening.id }}
        >
          {type === 'window' && windowImg ? (
            <KImage
              x={-len / 2}
              y={-thickness / 2}
              image={windowImg}
              width={len}
              height={thickness}
              opacity={0.95}
              stroke={isSelected ? '#ff9800' : '#222'}
              strokeWidth={isSelected ? 2 : 1}
            />
          ) : type === 'door' && doorImg ? (
            <KImage
              x={-len / 2}
              y={-doorRenderHeight / 2}
              image={doorImg}
              width={len}
              height={doorRenderHeight}
              opacity={0.95}
            />
          ) : (
            <Rect
              x={-len / 2}
              y={-thickness / 2}
              width={len}
              height={thickness}
              fill={type === 'door' ? '#4caf50' : '#2196f3'}
              opacity={0.85}
              stroke={isSelected ? '#ff9800' : '#222'}
              strokeWidth={isSelected ? 2 : 1}
              cornerRadius={type === 'door' ? 4 : 2}
            />
          )}
        </Group>
      );
    });
  };

  return (
    <div className="floorplanCanvasContainer" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={offset.x}
        y={offset.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer listening={false} name="gridLayer">
          <Rect
            x={0}
            y={0}
            width={dimensions.width / zoom}
            height={dimensions.height / zoom}
            fill="#ffffff"
          />
          {renderGrid()}
        </Layer>
        <Layer>
          {renderWalls()}
          {previewWall && (
            <Line
              points={[
                previewWall.x1,
                previewWall.y1,
                previewWall.x2,
                previewWall.y2,
              ]}
              stroke="#555"
              dash={[8, 8]}
              strokeWidth={previewWall.thickness}
              lineCap="square"
              lineJoin="miter"
            />
          )}
          {renderOpenings('door')}
          {renderOpenings('window')}
        </Layer>
      </Stage>
    </div>
  );
}

