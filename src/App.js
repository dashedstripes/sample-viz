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
      trackRef: null,
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
      sample: "/sample.wav",
      context: new AudioContext(),
      waveform: [],
      trackRef: null,
      slices: [{ id: "slice1", start: 60, end: 90, color: "red", data: [] }],
    },
  });

  const [sequence, setSequence] = useState({
    track1: ["slice1", "slice2"],
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

  async function playSequence() {
    for (const clipId of sequence.track1) {
      if (clipId === null) {
        continue;
      }

      const track = tracks.track1;
      const slice = track.slices.find((slice) => slice.id === clipId);

      const audioRef = document.getElementById(track.id);
      if (!track.trackRef) {
        // Only create and connect once
        const trackRef = track.context.createMediaElementSource(audioRef);
        trackRef.connect(track.context.destination);
        track.trackRef = trackRef;
      }

      if (track.context === "suspended") {
        track.context.resume();
      }

      audioRef.currentTime = (slice.start / 100) * audioRef.duration;
      audioRef.play();

      await new Promise((resolve) => {
        function sliceEnd() {
          if (audioRef.currentTime >= (slice.end / 100) * audioRef.duration) {
            audioRef.pause();
            audioRef.removeEventListener("timeupdate", sliceEnd);
            resolve();
          }
        }
        audioRef.addEventListener("timeupdate", sliceEnd);
      });
    }
  }

  return (
    <div className="h-screen">
      <div className="container mx-auto p-8">
        <h1 className="font-bold text-2xl mb-8">SAMPLE VIZ</h1>
        <div className="flex flex-col gap-16">
          {Object.values(tracks).map((track) => (
            <div key={track.id} className="">
              <TrackCanvas
                trackId={track.id}
                waveform={track.waveform}
                slices={track.slices}
                volume={track.volume}
              />
              <div className="text-center mt-8">
                <h2 className="font-bold text-xl">{track.title}</h2>
                <h3>{track.artist}</h3>
                <h4>({track.year})</h4>
              </div>
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
