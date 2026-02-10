import { create } from 'zustand';
import { snapToGrid } from '../utils/snapping';

const GRID_SIZE = 10;

const createWall = ({ x1, y1, x2, y2, thickness = 6 }) => ({
  id: crypto.randomUUID(),
  x1,
  y1,
  x2,
  y2,
  thickness,
});

const createOpening = ({ type, wallId, offset, width }) => ({
  id: crypto.randomUUID(),
  type,
  wallId,
  offset,
  width,
});

export const useFloorplanStore = create((set, get) => ({
  tool: 'wall', // 'wall' | 'door' | 'window' | 'select' | 'delete'
  walls: [],
  doors: [],
  windows: [],
  selected: null, // { type: 'wall' | 'door' | 'window', id }
  zoom: 1,
  offset: { x: 0, y: 0 },

  setTool: (tool) => set({ tool }),

  // Walls
  addWall: (wall) =>
    set((state) => ({
      walls: [...state.walls, createWall(wall)],
    })),

  updateWall: (id, patch) =>
    set((state) => ({
      walls: state.walls.map((wall) =>
        wall.id === id ? { ...wall, ...patch } : wall
      ),
    })),

  removeWall: (id) =>
    set((state) => ({
      walls: state.walls.filter((wall) => wall.id !== id),
      doors: state.doors.filter((d) => d.wallId !== id),
      windows: state.windows.filter((w) => w.wallId !== id),
      selected:
        state.selected && state.selected.type === 'wall' && state.selected.id === id
          ? null
          : state.selected,
    })),

  // Doors / windows
  addDoor: ({ wallId, offset, width }) =>
    set((state) => ({
      doors: [
        ...state.doors,
        createOpening({ type: 'door', wallId, offset, width }),
      ],
    })),

  addWindow: ({ wallId, offset, width }) =>
    set((state) => ({
      windows: [
        ...state.windows,
        createOpening({ type: 'window', wallId, offset, width }),
      ],
    })),

  updateDoor: (id, patch) =>
    set((state) => ({
      doors: state.doors.map((door) =>
        door.id === id ? { ...door, ...patch } : door
      ),
    })),

  updateWindow: (id, patch) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, ...patch } : win
      ),
    })),

  removeDoor: (id) =>
    set((state) => ({
      doors: state.doors.filter((door) => door.id !== id),
      selected:
        state.selected && state.selected.type === 'door' && state.selected.id === id
          ? null
          : state.selected,
    })),

  removeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((win) => win.id !== id),
      selected:
        state.selected && state.selected.type === 'window' && state.selected.id === id
          ? null
          : state.selected,
    })),

  // Selection
  setSelected: (selected) => set({ selected }),
  clearSelection: () => set({ selected: null }),

  deleteSelected: () => {
    const { selected, removeWall, removeDoor, removeWindow } = get();
    if (!selected) return;
    if (selected.type === 'wall') {
      removeWall(selected.id);
    } else if (selected.type === 'door') {
      removeDoor(selected.id);
    } else if (selected.type === 'window') {
      removeWindow(selected.id);
    }
  },

  // Viewport
  setZoom: (zoom) => set({ zoom }),
  setOffset: (offset) => set({ offset }),

  zoomBy: (factor, anchor) => {
    const { zoom, offset } = get();
    const newZoom = Math.max(0.25, Math.min(zoom * factor, 4));

    if (!anchor) {
      set({ zoom: newZoom });
      return;
    }

    // Zoom relative to an anchor point (world-space zooming)
    const worldX = (anchor.x - offset.x) / zoom;
    const worldY = (anchor.y - offset.y) / zoom;

    const newOffset = {
      x: anchor.x - worldX * newZoom,
      y: anchor.y - worldY * newZoom,
    };

    set({ zoom: newZoom, offset: newOffset });
  },

  panBy: (dx, dy) =>
    set((state) => ({
      offset: { x: state.offset.x + dx, y: state.offset.y + dy },
    })),

  resetView: () => set({ zoom: 1, offset: { x: 0, y: 0 } }),

  // Helpers
  snapPoint: (x, y) => {
    const snapped = snapToGrid(x, y, GRID_SIZE);
    return { x: snapped.x, y: snapped.y };
  },
}));

