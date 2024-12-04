import Track from "./Track";

const tracks = [
  {
    id: "track1",
    artist: "Igloo",
    title: "OLD TOWN",
    year: 2012,
    slices: [
      { id: "slice1", start: 10, end: 30, color: "red" },
      { id: "slice2", start: 40, end: 60, color: "blue" },
    ],
  },
  {
    id: "track2",
    artist: "Igloo",
    title: "DUST",
    year: 2012,
    slices: [{ id: "slice3", start: 60, end: 70, color: "green" }],
  },
];

function App() {
  return (
    <div>
      {tracks.map((track) => (
        <Track
          key={track.id}
          id={track.id}
          artist={track.artist}
          title={track.title}
          year={track.year}
          slices={track.slices}
        />
      ))}
    </div>
  );
}

export default App;
