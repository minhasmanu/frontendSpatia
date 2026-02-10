import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawFloorplan from '../components/DrawFloorplan';
import './DrawFloorplanPage.css';

export default function DrawFloorplanPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleGenerateNow = async ({ stage }) => {
    if (!stage) return;

    try {
      // hide grid lines during export so the white background rect remains
      const gridLines = stage.findOne('.gridLines');
      const prevVisible = gridLines ? gridLines.visible() : null;
      if (gridLines) gridLines.visible(false);

      const dataUrl = stage.toDataURL({ mimeType: 'image/jpeg', pixelRatio: 2 });

      // restore grid lines visibility
      if (gridLines && prevVisible !== null) gridLines.visible(prevVisible);

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'floorplan.jpg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result;
        if (!imageDataUrl) return;

        localStorage.setItem('floorplanImage', imageDataUrl);
        navigate('/dashboard', { state: { autoUploadFloorplan: true } });
      };
      reader.onerror = () => {
        alert('Failed to prepare image for upload. Please try again.');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate floorplan image', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  return (
    <div className="drawFloorplanPage">
      <section className="drawFloorplanMain">
        <header className="drawFloorplanHeader">
          <h1 className="drawFloorplanTitle">Draw Your Floorplan</h1>
          <p className="drawFloorplanSubtitle">
            Sketch your floorplan directly on the canvas or use the drawing tools to create a custom layout.
          </p>
        </header>

        <DrawFloorplan onGenerateNow={handleGenerateNow} />
      </section>
    </div>
  );
}
