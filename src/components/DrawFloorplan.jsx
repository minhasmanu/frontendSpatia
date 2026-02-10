import { useRef } from 'react';
import { useFloorplanStore } from '../store/floorplanStore';
import FloorplanCanvas from './FloorplanCanvas';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import './DrawFloorplan.css';

export default function DrawFloorplan({ onGenerateNow }) {
  const stageRef = useRef(null);
  const { walls, doors, windows } = useFloorplanStore();

  const handleGenerate = () => {
    if (!onGenerateNow || !stageRef.current) return;

    const state = {
      stage: stageRef.current,
      walls,
      doors,
      windows,
    };
    onGenerateNow(state);
  };

  return (
    <div className="drawFloorplanContainer">
      <div className="drawFloorplanShell">
        <Toolbar onGenerate={handleGenerate} />
        <FloorplanCanvas onStageReady={(stage) => (stageRef.current = stage)} />
        <Sidebar />
      </div>
    </div>
  );
}
