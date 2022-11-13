import { OBSEventTypes } from "obs-websocket-js";
import { useState } from "react";
import { OBSWebsocket } from "../obs/OBSWebsocket";

function isString(x: any): x is string {
  return typeof x === "string";
}

export type AudiosState = Record<string, boolean>;

interface UseStateAudiosReturn {
  audios: AudiosState;
  getInitialAudio: (obs: OBSWebsocket) => void;
  toggleMute: (obs: OBSWebsocket) => (inputName: string) => void;
  updateAudios: (data: OBSEventTypes["InputMuteStateChanged"]) => void;
}

export function useStateAudios(): UseStateAudiosReturn {
  const [audios, setAudios] = useState<AudiosState>({});

  const getInitialAudio = (obs: OBSWebsocket) => {
    obs.send(
      "GetInputList",
      { inputKind: "coreaudio_input_capture" },
      (data) => {
        console.log(data);
        for (const input of data.inputs) {
          const { inputName } = input;

          if (!isString(inputName)) {
            continue;
          }

          obs.send("GetInputMute", { inputName }, (data) => {
            console.log({ inputName, data });
            setAudios((prev) => ({
              ...prev,
              [inputName]: data.inputMuted,
            }));
            // debugger;
          });
        }
      }
    );
  };

  const updateAudios = (data: OBSEventTypes["InputMuteStateChanged"]) => {
    setAudios((prev) => ({
      ...prev,
      [data.inputName]: data.inputMuted,
    }));
  };

  const toggleMute = (obs: OBSWebsocket) => (inputName: string) => {
    obs.send("ToggleInputMute", {
      inputName,
    });
  };

  return {
    audios,
    getInitialAudio,
    updateAudios,
    toggleMute,
  };
}
