import { useRef, useState, useEffect } from 'react';
import './DrawFloorplan.css';

export default function DrawFloorplan({ onGenerateNow }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [lines, setLines] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);

  const GRID_SIZE = 20;
  const CANVAS_HEIGHT = 600;
  const LINE_COLOR = '#000000';
  const LINE_WIDTH = 6;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = CANVAS_HEIGHT;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const ctx = canvas.getContext('2d');
    setContext(ctx);

    // Draw initial grid
    drawGrid(ctx, canvas, [], null);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (context) {
      const canvas = canvasRef.current;
      drawGrid(context, canvas, lines, currentLine);
    }
  }, [lines, currentLine, context]);

  const drawGrid = (ctx, canvas, drawnLines, previewLine) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw all stored wall lines
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'square';

    drawnLines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });

    // Draw preview line (line being drawn)
    if (previewLine) {
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(previewLine.x1, previewLine.y1);
      ctx.lineTo(previewLine.x2, previewLine.y2);
      ctx.stroke();
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentLine(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoordinates(e);
    
    // Calculate deltas
    const deltaX = Math.abs(coords.x - startPoint.x);
    const deltaY = Math.abs(coords.y - startPoint.y);
    
    // Determine if line should be horizontal or vertical
    // If horizontal movement is greater, draw horizontal line
    // Otherwise, draw vertical line
    let x2, y2;
    
    if (deltaX > deltaY) {
      // Horizontal line - keep same Y
      x2 = coords.x;
      y2 = startPoint.y;
    } else {
      // Vertical line - keep same X
      x2 = startPoint.x;
      y2 = coords.y;
    }

    setCurrentLine({
      x1: startPoint.x,
      y1: startPoint.y,
      x2: x2,
      y2: y2,
    });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoordinates(e);

    // Calculate deltas to determine line direction
    const deltaX = Math.abs(coords.x - startPoint.x);
    const deltaY = Math.abs(coords.y - startPoint.y);
    
    // Determine constrained endpoint
    let x2, y2;
    
    if (deltaX > deltaY) {
      // Horizontal line
      x2 = coords.x;
      y2 = startPoint.y;
    } else {
      // Vertical line
      x2 = startPoint.x;
      y2 = coords.y;
    }

    // Calculate distance based on constrained line
    const distance = Math.sqrt(
      Math.pow(x2 - startPoint.x, 2) + Math.pow(y2 - startPoint.y, 2)
    );

    if (distance > 5) {
      // Threshold of 5 pixels to register as a valid line
      const newLine = {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: x2,
        y2: y2,
      };
      setLines([...lines, newLine]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentLine(null);
  };

  const handleClear = () => {
    setLines([]);
    setCurrentLine(null);
    setStartPoint(null);
    setIsDrawing(false);
  };

  const handleGenerateNow = () => {
    if (onGenerateNow) {
      onGenerateNow(canvasRef.current, lines);
    }
  };

  return (
    <div className="drawFloorplanContainer">
      <div className="toolbar">
        <span className="wallCount">Walls: {lines.length}</span>
        <button className="toolbarButton clear" onClick={handleClear}>
          Clear
        </button>
        <button className="toolbarButton generate" onClick={handleGenerateNow}>
          Generate Now
        </button>
      </div>

      <div className="canvasWrapper">
        <canvas
          ref={canvasRef}
          className="drawingCanvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
