import { useEffect, useState } from "react";

export function Timeline({ sequence, tracks, onPlayPressed }) {
  let timelineTracks = [];
  for (const [trackId, sequenceClips] of Object.entries(sequence)) {
    const track = tracks[trackId];
    const clips = sequenceClips.map((clipId) => {
      if (clipId === null) {
        return null;
      }

      return track.slices.find((slice) => slice.id === clipId);
    });

    timelineTracks.push({ trackId, title: track.title, clips });
  }

  return (
    <div>
      <div className="bg-black p-4">
        <button onClick={() => onPlayPressed()}>Play</button>
      </div>
      {timelineTracks.map((track) => (
        <div
          key={track.trackId}
          className="bg-black grid grid-cols-4 gap-8 outline items-center"
        >
          <p className="font-bold text-xl">{track.title}</p>
          {track.clips.map((clip) => (
            <div
              className="bg-blue-400 p-4 rounded"
              key={clip.id}
              style={{ backgroundColor: clip.color }}
            >
              {clip.id}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
