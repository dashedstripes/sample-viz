import React, { useRef } from "react";
import { useEffect } from "react";

export function TrackAudio({ context, sample, onPlay }) {
  const audioRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (trackRef.current) return;
    trackRef.current = context.createMediaElementSource(audioRef.current);
    trackRef.current.connect(context.destination);
  }, [context]);

  function play() {
    if (context.state === "suspended") {
      context.resume();
    }

    audioRef.current.play();
  }

  return (
    <div>
      <button onClick={() => play()}>PLAYYYY</button>
      <audio ref={audioRef} src={sample}></audio>
    </div>
  );
}
