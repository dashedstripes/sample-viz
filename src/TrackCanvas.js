import { useEffect, useRef } from "react";

export default function TrackCanvas({ trackId, waveform, slices, volume = 1 }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = document.getElementById(trackId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform) return;

    const container = document.getElementById("canvasContainer");

    canvas.width = container.clientWidth;

    const ctx = canvas.getContext("2d");

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Clear canvas
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(100, 100, 100)";
      ctx.beginPath();

      const step = Math.ceil(waveform.length / canvas.width);
      const amp = (canvas.height / 2) * volume;

      for (let i = 0; i < canvas.width; i++) {
        const min = Math.min(...waveform.slice(i * step, (i + 1) * step));
        const max = Math.max(...waveform.slice(i * step, (i + 1) * step));

        const currentTimePercent = i / canvas.width;
        const matchingSlice = slices.find((slice) => {
          const sliceStartPercent = slice.start / 100;
          const sliceEndPercent = slice.end / 100;
          return (
            currentTimePercent >= sliceStartPercent &&
            currentTimePercent <= sliceEndPercent
          );
        });

        ctx.strokeStyle = matchingSlice
          ? matchingSlice.color
          : "rgb(100, 100, 100)";

        ctx.beginPath();
        ctx.moveTo(i, canvas.height / 2 + min * amp);
        ctx.lineTo(i, canvas.height / 2 + max * amp);
        ctx.stroke();
      }

      ctx.stroke();

      // Draw playhead
      if (audioRef) {
        const playheadX =
          (audioRef.currentTime / audioRef.duration) * canvas.width;

        // Draw current slice in red
        const step = Math.ceil(waveform.length / canvas.width);
        const amp = (canvas.height / 2) * volume;
        const index = Math.floor(playheadX * step);

        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        const min = Math.min(...waveform.slice(index, index + step));
        const max = Math.max(...waveform.slice(index, index + step));
        ctx.moveTo(playheadX, canvas.height / 2 + min * amp);
        ctx.lineTo(playheadX, canvas.height / 2 + max * amp);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, waveform, volume, slices]);

  return (
    <div id="canvasContainer">
      <canvas
        ref={canvasRef}
        width="800"
        height="100"
        className="border border-black"
      ></canvas>
    </div>
  );
}
