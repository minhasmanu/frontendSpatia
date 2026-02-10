import { useEffect, useRef } from 'react';
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

  const handleGenerateNow = (canvas, lines) => {
    if (!canvas) return;

    // Create a clean canvas for the final image (no grid, only walls)
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    const cleanCtx = cleanCanvas.getContext('2d');

    // Fill with white background
    cleanCtx.fillStyle = '#FFFFFF';
    cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);

    // Draw only the wall lines in black with sharp, thick strokes
    cleanCtx.strokeStyle = '#000000';
    cleanCtx.lineWidth = 10; // Thick lines for clarity
    cleanCtx.lineJoin = 'miter';
    cleanCtx.lineCap = 'square';

    // Draw all the lines
    lines.forEach((line) => {
      cleanCtx.beginPath();
      cleanCtx.moveTo(line.x1, line.y1);
      cleanCtx.lineTo(line.x2, line.y2);
      cleanCtx.stroke();
    });

    // Scale down for compression and convert to blob
    const scaleFactor = 0.75; // Increased from 0.5 to keep better resolution
    const compressedCanvas = document.createElement('canvas');
    compressedCanvas.width = cleanCanvas.width * scaleFactor;
    compressedCanvas.height = cleanCanvas.height * scaleFactor;
    const compressCtx = compressedCanvas.getContext('2d');

    // Draw the clean canvas content scaled down
    compressCtx.scale(scaleFactor, scaleFactor);
    compressCtx.drawImage(cleanCanvas, 0, 0);

    // Convert to PNG for better quality with lines (PNG handles line art better than JPG)
    compressedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Failed to generate image. Please try again.");
          return;
        }

        // Download the image
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'floorplan.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);

        // Convert blob to data URL and store in localStorage
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          localStorage.setItem('floorplanImage', dataUrl);
          
          // Navigate to dashboard with flag to auto-upload
          navigate('/dashboard', { state: { autoUploadFloorplan: true } });
        };
        reader.onerror = () => {
          alert("Failed to prepare image for upload. Please try again.");
        };
        reader.readAsDataURL(blob);
      },
      'image/png'
    );
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
