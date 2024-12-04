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
  const [slices, setSlices] = useState([
    { id: "slice1", start: 10, end: 30, color: "red" },
    { id: "slice2", start: 40, end: 60, color: "blue" },
  ]);

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

      const step = Math.ceil(waveformData.length / canvas.width);
      const amp = (canvas.height / 2) * volume;

      for (let i = 0; i < canvas.width; i++) {
        const min = Math.min(...waveformData.slice(i * step, (i + 1) * step));
        const max = Math.max(...waveformData.slice(i * step, (i + 1) * step));

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

  function playSlice(start, end) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    audioRef.current.currentTime = (start / 100) * audioRef.current.duration;
    audioRef.current.play();
    audioRef.current.addEventListener("timeupdate", function sliceEnd() {
      if (
        audioRef.current.currentTime >=
        (end / 100) * audioRef.current.duration
      ) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", sliceEnd);
      }
    });
  }

  return (
    <div className="grid grid-cols-2">
      <div className="bg-black p-16">
        <audio ref={audioRef} src="/sample.wav"></audio>

        <div className="flex items-center space-x-4 bg-white p-4 rounded-md shadow">
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
            className="w-48 accent-indigo-500"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg px-6 py-3 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
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
            Play Track
          </button>
          {slices.map((slice) => (
            <button
              key={slice.id}
              className="text-white bg-purple-500 hover:bg-purple-600 rounded-lg px-6 py-3 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              onClick={() => playSlice(slice.start, slice.end)}
            >
              Play Slice {slice.start}-{slice.end}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-black p-16">
        <div id="canvasContainer">
          <canvas
            ref={canvasRef}
            width="800"
            height="100"
            className="border border-black"
          ></canvas>
        </div>
        <div className="text-white text-center mt-8">
          <h2 className="font-bold text-xl">OLD TOWN</h2>
          <p>
            by <span className="font-bold">Igloo</span>
          </p>
          <p className="text-sm">(2012)</p>
        </div>
      </div>
    </div>
  );
}

export default App;
