import { useState, useEffect, useRef } from "react";

const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
const analyser = audioContext.createAnalyser();

function App() {
  const canvasRef = useRef(null);
  const trackRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [waveformData, setWaveformData] = useState(null);

  useEffect(() => {
    if (trackRef.current) return;
    trackRef.current = audioContext.createMediaElementSource(audioRef.current);
    trackRef.current
      .connect(gainNode)
      .connect(analyser)
      .connect(audioContext.destination);

    // Load and analyze full waveform
    const audioElement = audioRef.current;
    audioElement.addEventListener("loadedmetadata", async () => {
      const response = await fetch("/sample.wav");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      setWaveformData(channelData);
    });
  }, [audioRef]);

  useEffect(() => {
    gainNode.gain.value = parseFloat(volume);
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

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

      const step = Math.ceil(waveformData.length / canvas.width);
      const amp = (canvas.height / 2) * volume;

      for (let i = 0; i < canvas.width; i++) {
        const min = Math.min(...waveformData.slice(i * step, (i + 1) * step));
        const max = Math.max(...waveformData.slice(i * step, (i + 1) * step));

        ctx.moveTo(i, canvas.height / 2 + min * amp);
        ctx.lineTo(i, canvas.height / 2 + max * amp);
      }

      ctx.stroke();

      // Draw playhead
      if (audioRef.current) {
        const playheadX =
          (audioRef.current.currentTime / audioRef.current.duration) *
          canvas.width;

        // Draw current slice in red
        const step = Math.ceil(waveformData.length / canvas.width);
        const amp = (canvas.height / 2) * volume;
        const index = Math.floor(playheadX * step);

        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        const min = Math.min(...waveformData.slice(index, index + step));
        const max = Math.max(...waveformData.slice(index, index + step));
        ctx.moveTo(playheadX, canvas.height / 2 + min * amp);
        ctx.lineTo(playheadX, canvas.height / 2 + max * amp);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasRef, waveformData, volume]);

  return (
    <div>
      <div>
        <canvas
          ref={canvasRef}
          width="800"
          height="200"
          className="border border-black"
        ></canvas>
      </div>

      <audio ref={audioRef} src="/sample.wav"></audio>

      <input
        type="range"
        id="volume"
        min="0"
        max="4"
        value={volume}
        step="0.01"
        onChange={(e) => {
          setVolume(e.target.value);
        }}
      />

      <div>volume {volume}</div>

      <button
        onClick={() => {
          if (audioContext.state === "suspended") {
            audioContext.resume();
          }

          if (audioContext.state === "running") {
            audioContext.suspend();
            audioRef.current.pause();
          } else if (audioContext.state === "suspended") {
            audioContext.resume();
            audioRef.current.play();
          }
        }}
      >
        Play/Pause
      </button>
    </div>
  );
}

export default App;
