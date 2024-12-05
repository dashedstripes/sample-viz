import { useEffect, useState } from "react";
import { Timeline } from "./Timeline";
import Track from "./Track";
import { TrackAudio } from "./TrackAudio";
import TrackCanvas from "./TrackCanvas";

// const sequencer = {
//   track1: [["slice1", null, "slice2", null]],
//   track2: [[null, null, "slice3", null]],
// };

function App() {
  const [tracks, setTracks] = useState({
    track1: {
      id: "track1",
      artist: "Igloo",
      title: "OLD TOWN",
      year: 2012,
      volume: 1,
      sample: "/sample.wav",
      context: new AudioContext(),
      waveform: [],
      slices: [
        { id: "slice1", start: 10, end: 30, color: "#a8eb57", data: [] },
        { id: "slice2", start: 40, end: 60, color: "#b057eb", data: [] },
      ],
    },
  });

  const [sequence, setSequence] = useState({
    track1: [["slice1", null, "slice2", null]],
    track2: [[null, null, "slice3", null]],
  });

  useEffect(() => {
    async function getAudioData(trackId) {
      const audioContext = tracks[trackId].context;
      const response = await fetch(tracks[trackId].sample);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      // just get the left channel
      const channelData = audioBuffer.getChannelData(0);

      let newTracks = { ...tracks };

      newTracks[trackId].waveform = channelData;

      // get the raw waveform data for each slice
      for (const slice of newTracks[trackId].slices) {
        const sliceData = channelData.slice(slice.start, slice.end);
        slice.data = sliceData;
      }

      setTracks(newTracks);
    }

    Object.values(tracks).forEach((track) => {
      getAudioData(track.id);
    });
  }, [tracks]);

  return (
    <div className="h-screen">
      <div className="container mx-auto p-8">
        <h1 className="font-bold text-2xl mb-8">SAMPLE VIZ</h1>
        {Object.values(tracks).map((track) => (
          <div key={track.id} className="">
            <TrackCanvas
              waveform={track.waveform}
              slices={track.slices}
              volume={track.volume}
            />
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-8">
        <Timeline />
      </div>
    </div>
  );
}

export default App;
