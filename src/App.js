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
      title: "DUST",
      year: 2012,
      volume: 1,
      sample: "/sample.wav",
      context: new AudioContext(),
      waveform: [],
      trackRef: null,
      slices: [{ id: "slice3", start: 60, end: 90, color: "red", data: [] }],
    },
  });

  const [sequence, setSequence] = useState({
    track1: [
      { clipId: "clip1", sliceId: "slice1" },
      { clipId: "clip2", sliceId: "slice2" },
      { clipId: "clip3", sliceId: "slice1" },
    ],
    track2: [{ clipId: "clip4", sliceId: "slice3" }],
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
    // it thinks it wants tracks here, but that causes infinite loop so nah
  }, []);

  async function playSequence() {
    // Get the longest track length
    const maxLength = Math.max(
      ...Object.values(sequence).map((track) => track.length),
    );

    for (let i = 0; i < maxLength; i++) {
      // Start all tracks that have a clip at this position
      const playPromises = Object.entries(sequence).map(
        ([trackId, trackSequence]) => {
          const clip = trackSequence[i];
          if (!clip) return Promise.resolve();

          const track = tracks[trackId];
          const slice = track.slices.find((slice) => slice.id === clip.sliceId);

          const audioRef = document.getElementById(track.id);
          if (!track.trackRef) {
            const trackRef = track.context.createMediaElementSource(audioRef);
            trackRef.connect(track.context.destination);
            track.trackRef = trackRef;
          }

          if (track.context === "suspended") {
            track.context.resume();
          }

          audioRef.currentTime = (slice.start / 100) * audioRef.duration;
          audioRef.play();

          return new Promise((resolve) => {
            function sliceEnd() {
              if (
                audioRef.currentTime >=
                (slice.end / 100) * audioRef.duration
              ) {
                audioRef.pause();
                audioRef.removeEventListener("timeupdate", sliceEnd);
                resolve();
              }
            }
            audioRef.addEventListener("timeupdate", sliceEnd);
          });
        },
      );

      // Wait for all tracks to finish their current slice before moving to next position
      await Promise.all(playPromises);
    }
  }

  function playSlice(sliceId) {
    console.log(sliceId);
    const track = Object.values(tracks).find((track) =>
      track.slices.some((slice) => slice.id === sliceId),
    );

    console.log(track);

    const slice = track.slices.find((slice) => slice.id === sliceId);
    const audioRef = document.getElementById(track.id);

    if (!track.trackRef) {
      const trackRef = track.context.createMediaElementSource(audioRef);
      trackRef.connect(track.context.destination);
      track.trackRef = trackRef;
    }

    if (track.context === "suspended") {
      track.context.resume();
    }

    audioRef.currentTime = (slice.start / 100) * audioRef.duration;
    audioRef.play();

    function sliceEnd() {
      if (audioRef.currentTime >= (slice.end / 100) * audioRef.duration) {
        audioRef.pause();
        audioRef.removeEventListener("timeupdate", sliceEnd);
      }
    }

    audioRef.addEventListener("timeupdate", sliceEnd);
  }

  return (
    <div className="h-screen">
      <div className="container mx-auto p-8 w-[65ch]">
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
          onClipClicked={(sliceId) => {
            playSlice(sliceId);
          }}
        />
      </div>
    </div>
  );
}

export default App;
