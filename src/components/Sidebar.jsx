import { useFloorplanStore } from '../store/floorplanStore';
import { wallLength } from '../utils/geometry';
import './Sidebar.css';

export default function Sidebar() {
  const { walls, doors, windows, selected } = useFloorplanStore();

  const selectedLabel = (() => {
    if (!selected) return 'None';
    const prefix =
      selected.type.charAt(0).toUpperCase() + selected.type.slice(1);
    return `${prefix} (${selected.id.slice(0, 6)}…)`;
  })();

  const selectedDetails = (() => {
    if (!selected) return null;

    if (selected.type === 'wall') {
      const wall = walls.find((w) => w.id === selected.id);
      if (!wall) return null;
      const length = wallLength(wall);
      return {
        typeLabel: 'Wall',
        length,
      };
    }

    if (selected.type === 'door') {
      const door = doors.find((d) => d.id === selected.id);
      if (!door) return null;
      return {
        typeLabel: 'Door',
        width: door.width,
      };
    }

    if (selected.type === 'window') {
      const win = windows.find((w) => w.id === selected.id);
      if (!win) return null;
      return {
        typeLabel: 'Window',
        width: win.width,
      };
    }

    return null;
  })();

  return (
    <aside className="fpSidebar">
      <header className="fpSidebarHeader">
        <h3 className="fpSidebarTitle">Floorplan</h3>
        <p className="fpSidebarSubtitle">Designed for future 3D conversion</p>
      </header>

      <section className="fpSidebarSection">
        <h4 className="fpSidebarSectionTitle">Summary</h4>
        <div className="fpSidebarStats">
          <div className="fpSidebarStat">
            <span className="fpSidebarStatLabel">Walls</span>
            <span className="fpSidebarStatValue">{walls.length}</span>
          </div>
          <div className="fpSidebarStat">
            <span className="fpSidebarStatLabel">Doors</span>
            <span className="fpSidebarStatValue">{doors.length}</span>
          </div>
          <div className="fpSidebarStat">
            <span className="fpSidebarStatLabel">Windows</span>
            <span className="fpSidebarStatValue">{windows.length}</span>
          </div>
        </div>
      </section>

      <section className="fpSidebarSection">
        <h4 className="fpSidebarSectionTitle">Selection</h4>
        <p className="fpSidebarSelection">{selectedLabel}</p>
        {selectedDetails && (
          <div className="fpSidebarProperties">
            <div className="fpSidebarPropRow">
              <span className="fpSidebarPropLabel">Type</span>
              <span className="fpSidebarPropValue">
                {selectedDetails.typeLabel}
              </span>
            </div>
            {'length' in selectedDetails && (
              <div className="fpSidebarPropRow">
                <span className="fpSidebarPropLabel">Length</span>
                <span className="fpSidebarPropValue">
                  {selectedDetails.length.toFixed(1)} px
                </span>
              </div>
            )}
            {'width' in selectedDetails && (
              <div className="fpSidebarPropRow">
                <span className="fpSidebarPropLabel">Width</span>
                <span className="fpSidebarPropValue">
                  {selectedDetails.width.toFixed(1)} px
                </span>
              </div>
            )}
          </div>
        )}
        <p className="fpSidebarHelp">
          Use <strong>Wall</strong>, <strong>Door</strong> and{' '}
          <strong>Window</strong> tools to sketch your 2D plan. The underlying
          data model is normalized by element type and ready to be mapped into a
          3D scene graph later.
        </p>
      </section>
    </aside>
  );
}

