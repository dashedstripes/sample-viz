const tracks = [
  {
    id: "track1",
    clips: [
      { start: 0, end: 40, color: "red" },
      { start: 60, end: 90, color: "blue" },
    ],
  },
  {
    id: "track2",
    clips: [
      { start: 0, end: 40, color: "green" },
      { start: 60, end: 80, color: "green" },
    ],
  },
];

export function Timeline() {
  return (
    <div className="outline p-16">
      <button>Play</button>
      {tracks.map((track) => (
        <div className="bg-slate-600 p-4 flex gap-4 items-center">
          <p>{track.id}</p>
          {track.clips.map((clip) => (
            <div
              key={clip.start}
              className="outline h-8"
              style={{
                width: `${clip.end - clip.start}px`,
                backgroundColor: clip.color,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
