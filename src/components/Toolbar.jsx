import { useFloorplanStore } from '../store/floorplanStore';
import './Toolbar.css';

const tools = [
  { id: 'select', label: 'Select' },
  { id: 'wall', label: 'Wall' },
  { id: 'door', label: 'Door' },
  { id: 'window', label: 'Window' },
  { id: 'delete', label: 'Delete' },
];

export default function Toolbar({ onGenerate }) {
  const { tool, setTool, zoom, zoomBy, resetView, deleteSelected } =
    useFloorplanStore();

  const handleZoomIn = () => zoomBy(1.15);
  const handleZoomOut = () => zoomBy(1 / 1.15);

  return (
    <aside className="fpToolbar">
      <div className="fpToolbarSection">
        <h3 className="fpToolbarTitle">Tools</h3>
        <div className="fpToolbarButtons">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`fpToolbarButton ${
                tool === t.id ? 'fpToolbarButton--active' : ''
              }`}
              onClick={() => setTool(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fpToolbarSection">
        <h3 className="fpToolbarTitle">View</h3>
        <div className="fpToolbarButtons fpToolbarButtons--compact">
          <button
            type="button"
            className="fpToolbarButton"
            onClick={handleZoomOut}
          >
            −
          </button>
          <span className="fpToolbarZoomLabel">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="fpToolbarButton"
            onClick={handleZoomIn}
          >
            +
          </button>
          <button
            type="button"
            className="fpToolbarButton fpToolbarButton--ghost"
            onClick={resetView}
          >
            Reset
          </button>
        </div>
        <p className="fpToolbarHint">Hold Shift + drag to pan</p>
      </div>

      <div className="fpToolbarSection fpToolbarSection--bottom">
        <button
          type="button"
          className="fpToolbarButton fpToolbarButton--danger"
          onClick={deleteSelected}
        >
          Delete selection
        </button>
        <button
          type="button"
          className="fpToolbarButton fpToolbarButton--primary"
          onClick={onGenerate}
        >
          Generate image
        </button>
      </div>
    </aside>
  );
}

