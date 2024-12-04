import { useState, useEffect, useRef } from "react";

const audioContext = new AudioContext();
const gainNode = audioContext.createGain();

function App() {
  const trackRef = useRef(null);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (trackRef.current) return;
    trackRef.current = audioContext.createMediaElementSource(audioRef.current);
    trackRef.current.connect(gainNode).connect(audioContext.destination);
  }, [audioRef]);

  useEffect(() => {
    gainNode.gain.value = parseFloat(volume);
  }, [volume]);

  return (
    <div>
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
