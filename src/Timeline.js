export function Timeline({ sequence, tracks, onPlayPressed, onClipClicked }) {
  let timelineTracks = [];
  for (const [trackId, sequenceClips] of Object.entries(sequence)) {
    const track = tracks[trackId];
    const clips = sequenceClips.map((clip) => {
      if (clip === null) {
        return null;
      }

      const slice = track.slices.find((slice) => slice.id === clip.sliceId);
      return { slice, clipId: clip.clipId };
    });

    timelineTracks.push({ trackId, title: track.title, clips });
  }

  return (
    <div className="flex gap-8 items-start p-4">
      <div className="sticky top-0">
        <button
          onClick={() => onPlayPressed()}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-colors"
        >
          Play
        </button>
      </div>
      <div className="flex-grow">
        {timelineTracks.map((track) => (
          <div
            key={track.trackId}
            className="bg-gray-800 rounded-lg p-4 grid grid-cols-4 gap-4 items-center mb-6 shadow-md"
          >
            <p className="font-bold text-xl text-white">{track.title}</p>
            {track.clips.map((clip) => (
              <div
                className="border-2 p-4 rounded-lg shadow-sm transition-transform hover:scale-105"
                key={clip.clipId}
                style={{ borderColor: clip.slice.color }}
                onClick={() => {
                  onClipClicked(clip.slice.id);
                }}
              >
                {clip.slice.id}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
