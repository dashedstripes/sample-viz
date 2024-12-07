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
    <div className="">
      <div className="grid grid-cols-2 items-start">
        <div className="sticky top-0 p-4 border-t border-white flex flex-col justify-between h-full">
          <div className="text-center">
            <h1 className="font-bold text-xl">Sample Breakdown</h1>
            <p>by @ahdumgray</p>
          </div>
          <button
            onClick={() => onPlayPressed()}
            className="bg-white w-full text-black hover:scale-105 px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
          >
            Play
          </button>
        </div>
        <div className="flex-grow border-white">
          {timelineTracks.map((track) => (
            <div
              key={track.trackId}
              className="p-4 grid grid-cols-4 gap-4 items-center shadow-md border border-white border-b-0"
            >
              <p className="font-bold text-xl text-white">{track.title}</p>
              {track.clips.map((clip) => (
                <div
                  className="h-12 rounded-lg shadow-sm transition-transform hover:scale-105 cursor-pointer"
                  key={clip.clipId}
                  style={{ backgroundColor: clip.slice.color }}
                  onClick={() => {
                    onClipClicked(clip.slice.id);
                  }}
                >
                  {/* {clip.slice.id} */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
