import { useEffect, useState } from "react";

export function Timeline({ sequence, tracks, onPlayPressed }) {
  const [sequenceTracks, setSequenceTracks] = useState([]);

  useEffect(() => {
    let newSequenceTracks = [];
    for (const [trackId, sequenceClips] of Object.entries(sequence)) {
      const track = tracks[trackId];
      const clips = sequenceClips.map((clipId) => {
        if (clipId === null) {
          return null;
        }

        return track.slices.find((slice) => slice.id === clipId);
      });

      newSequenceTracks.push(clips);
    }

    setSequenceTracks(newSequenceTracks);
  }, [sequence, tracks]);

  return (
    <div>
      <button onClick={() => onPlayPressed()}>Play</button>
      {Object.values(sequence).map((clips) => (
        <div key={clips} className="bg-slate-600 p-4 grid grid-cols-4 gap-8">
          {clips.map((clip) => (
            <div className="bg-blue-400 p-4 rounded" key={clip}>
              {clip}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
