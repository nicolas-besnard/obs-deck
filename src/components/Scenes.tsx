import { useScenes, useCurrentScene, useObs } from "../context/obsProvider";
import { Button } from "./Button";

export function Scenes() {
  const scenes = useScenes();
  const currentScene = useCurrentScene();

  const obs = useObs();

  const changeScene = (sceneName: string) => {
    obs.send("SetCurrentProgramScene", { sceneName });
  };

  return (
    <div className="flex gap-4">
      {scenes.map((scene) => (
        <Button
          onClick={() => changeScene(scene.sceneName)}
          key={scene.sceneName}
          icon="tv"
          isActive={scene.sceneName === currentScene}
        >
          {scene.sceneName}
        </Button>
      ))}
    </div>
  );
}
