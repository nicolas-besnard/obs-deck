import React, {
  createContext,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { OBSEventTypes, OBSResponseTypes } from "obs-websocket-js";
import { OBSScene, OBSSource } from "../obs/types";
import { OBSWebsocket } from "../obs/OBSWebsocket";

import { useStateAudios, AudiosState } from "./useAudios";
import { useSceneFilters } from "./useSceneFilters";

interface OBSContextProviderProps {
  children: ReactNode;
  host: string;
  password: string;
}

const OBSContext = createContext({
  scenes: [] as OBSScene[],
  obsRef: { current: new OBSWebsocket() },
  currentSceneFilters: [] as string[],
  currentScene: "",
  enableFilter: (_filterName: string) => {},
  audios: {
    audios: {} as AudiosState,
    toggleMute: (_inputName: string) => {},
  },
});

export function useScenes(): OBSScene[] {
  return useContext(OBSContext).scenes;
}

export function useScene(sceneName: string): OBSScene | undefined {
  return useContext(OBSContext).scenes.find((s) => s.name === sceneName);
}

// export function useSources(groupName?: string): OBSSource[] {
//   return useContext(OBSContext).sources.filter(
//     (s) => s.groupName === groupName
//   );
// }

export function useCurrentScene(): string {
  return useContext(OBSContext).currentScene;
}

export function useObs(): OBSWebsocket {
  return useContext(OBSContext).obsRef.current;
}

interface SceneFilters {
  filters: string[];
  enableFilter: (filterName: string) => void;
}

export function useCurrentSceneFilters(): SceneFilters {
  const filters = useContext(OBSContext).currentSceneFilters;
  const { enableFilter } = useContext(OBSContext);

  return {
    filters,
    enableFilter,
  };
}

export function useAudios(): {
  audios: AudiosState;
  toggleMute: (inputName: string) => void;
} {
  return useContext(OBSContext).audios;
}

export function OBSContextProvider({
  children,
  host,
  password,
}: OBSContextProviderProps) {
  const [scenes, setScenes] = useState<OBSScene[]>([]);
  const { sceneFilters, getSceneFilters, enableFilter } = useSceneFilters();
  const { audios, getInitialAudio, updateAudios, toggleMute } =
    useStateAudios();
  const [currentScene, setCurrentScene] = useState<string>("");

  const obsRef = useRef<OBSWebsocket>(new OBSWebsocket());
  const [error, setError] = useState<Error | null>(null);

  useEffect(function () {
    const obs = obsRef.current;

    const onSwitchScene = (
      data: OBSEventTypes["CurrentProgramSceneChanged"]
    ) => {
      setCurrentScene(data.sceneName);
      getSceneFilters(obs)(data.sceneName);
    };

    const connect = () => {
      setError(null);
      obs
        .connect(host, password)
        .then(() => {
          getInitialAudio(obs);
          obs.send("GetSceneList", undefined, (data) => {
            setScenes(data.scenes as OBSScene[]);
            setCurrentScene(data.currentProgramSceneName);
            getSceneFilters(obs)(data.currentProgramSceneName);
          });
        })
        .catch((err) => {
          console.error({ error });
          setError(err);
        });
    };

    const disconnect = () => {
      obs.close();
    };

    connect();

    window.addEventListener("focus", connect);
    window.addEventListener("blur", disconnect);

    obs.on("CurrentProgramSceneChanged", onSwitchScene);
    obs.on("InputMuteStateChanged", updateAudios);

    return () => {
      obs.off("CurrentProgramSceneChanged", onSwitchScene);
      obs.off("InputMuteStateChanged", updateAudios);
      window.removeEventListener("focus", connect);
      window.removeEventListener("blur", disconnect);
    };
  }, []);

  const toggleMuteWithObs = useCallback(
    (inputName: string) => {
      toggleMute(obsRef.current)(inputName);
    },
    [obsRef]
  );

  const enableFilterWithObs = useCallback(
    (filterName: string) => {
      enableFilter(obsRef.current)(currentScene, filterName);
    },
    [obsRef, currentScene]
  );

  return (
    <OBSContext.Provider
      value={{
        scenes,
        obsRef,
        currentScene,
        currentSceneFilters: sceneFilters,
        enableFilter: enableFilterWithObs,
        audios: {
          audios,
          toggleMute: toggleMuteWithObs,
        },
      }}
    >
      {error && (
        <Reconnect host={host} password={password} error={`${error}`} />
      )}
      {children}
    </OBSContext.Provider>
  );
}

function Reconnect({
  host,
  password,
  error,
}: {
  host: string;
  password: string;
  error: string;
}) {
  const onSubmit = (evt: SyntheticEvent<HTMLFormElement, Event>) => {
    evt.preventDefault();
    const data = new FormData(evt.target as HTMLFormElement);
    window.location.href = `${window.location.pathname}?host=${data.get(
      "host"
    )}&password=${data.get("password")}`;
  };

  return (
    <form className="modal" onSubmit={onSubmit}>
      <div className="bg-slate-700 p-4 rounded container mx-auto">
        {error}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-white"
            >
              Host
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="first-name"
                id="first-name"
                autoComplete="given-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={host}
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="last-name"
                id="last-name"
                autoComplete="family-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={password}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 sm:col-span-6">
          <button
            type="button"
            className="w-full text-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Connection
          </button>
        </div>
      </div>
    </form>
  );
}
