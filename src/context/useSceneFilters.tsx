import { OBSWebsocket } from "../obs/OBSWebsocket";
import React, { useState } from "react";
import { OBSResponseTypes } from "obs-websocket-js";

interface UseSceneFiltersReturn {
  sceneFilters: string[];
  getSceneFilters: (obs: OBSWebsocket) => (sceneName: string) => void;
  enableFilter: (
    obs: OBSWebsocket
  ) => (sourceName: string, filterName: string) => void;
}

export function useSceneFilters(): UseSceneFiltersReturn {
  const [currentSceneFilters, setCurrentSceneFilters] = useState<string[]>([]);

  const getSceneFilters = (obs: OBSWebsocket) => (sceneName: string) => {
    obs.send(
      "GetSourceFilterList",
      { sourceName: sceneName },
      (data: OBSResponseTypes["GetSourceFilterList"]) => {
        setCurrentSceneFilters(
          data.filters.map((filter) => filter.filterName) as string[]
        );
      }
    );
  };

  const enableFilter =
    (obs: OBSWebsocket) => (sourceName: string, filterName: string) => {
      obs.send(
        "SetSourceFilterEnabled",
        {
          sourceName,
          filterName,
          filterEnabled: true,
        },
        (data) => {
          console.log("SetSourceFilterEnabled", { data });
        }
      );
    };

  return {
    sceneFilters: currentSceneFilters,
    getSceneFilters,
    enableFilter,
  };
}
