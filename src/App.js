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
      playhead: 0,
      sample: "/sample.wav",
      context: new AudioContext(),
      waveform: [],
      ref: null,
      slices: [
        { id: "slice1", start: 10, end: 30, color: "#a8eb57", data: [] },
        { id: "slice2", start: 40, end: 60, color: "#b057eb", data: [] },
      ],
    },
    track2: {
      id: "track2",
      artist: "Igloo",
      title: "OLD TOWN",
      year: 2012,
      volume: 1,
      playhead: 0,
      sample: "/sample.wav",
      context: new AudioContext(),
      waveform: [],
      slices: [{ id: "slice1", start: 60, end: 90, color: "red", data: [] }],
    },
  });

  const [sequence, setSequence] = useState({
    track1: ["slice1"],
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

  useEffect(() => {
    // Set up audio event listeners
    Object.values(tracks).forEach((track) => {
      const audio = document.getElementById(track.id);

      audio.addEventListener("timeupdate", () => {
        setTracks((prevTracks) => ({
          ...prevTracks,
          [track.id]: {
            ...prevTracks[track.id],
            playhead: Math.floor(audio.currentTime * 100), // Convert to same scale as slice positions
          },
        }));
      });

      audio.addEventListener("ended", () => {
        setTracks((prevTracks) => ({
          ...prevTracks,
          [track.id]: {
            ...prevTracks[track.id],
            playhead: 0,
          },
        }));
      });
    });
  }, [tracks]);

  function playSequence() {
    sequence.track1.forEach((clipId, index) => {
      if (clipId === null) {
        return;
      }

      const track = tracks.track1;
      const slice = track.slices.find((slice) => slice.id === clipId);

      const audio = document.getElementById(track.id);
      audio.currentTime = slice.start / 100;
      audio.play();

      setTracks((prevTracks) => ({
        ...prevTracks,
        track1: {
          ...prevTracks.track1,
          playhead: slice.start,
        },
      }));
    });
  }

  return (
    <div className="h-screen">
      <div className="container mx-auto p-8">
        <h1 className="font-bold text-2xl mb-8">SAMPLE VIZ</h1>
        <div className="flex flex-col gap-8">
          {Object.values(tracks).map((track) => (
            <div key={track.id} className="">
              <TrackCanvas
                trackId={track.id}
                waveform={track.waveform}
                slices={track.slices}
                volume={track.volume}
                playhead={track.playhead}
              />
              <audio id={track.id} src={track.sample}></audio>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-8">
        <Timeline
          sequence={sequence}
          tracks={tracks}
          onPlayPressed={() => {
            playSequence();
          }}
        />
      </div>
    </div>
  );
}

export default App;
