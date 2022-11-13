import { useAudios, useObs } from "../context/obsProvider";
import { Button } from "./Button";

export function Audios() {
  const { audios, toggleMute } = useAudios();
  const obs = useObs();

  return (
    <div className="flex gap-4">
      {Object.entries(audios).map(([audio, muted]) => (
        <Button
          muted={muted}
          isActive={!muted}
          onClick={() => toggleMute(audio)}
          key={audio}
          icon={muted ? "speaker-muted" : "speaker"}
        >
          {audio}
        </Button>
      ))}
    </div>
  );
}
