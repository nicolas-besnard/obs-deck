import { useCurrentSceneFilters } from "../context/obsProvider";
import { Button } from "./Button";

export function Filters() {
  const { filters, enableFilter } = useCurrentSceneFilters();

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {filters.map((filter) => {
        return (
          <Button
            key={filter}
            onClick={() => enableFilter(filter)}
            icon="arrows-right-left"
            bordered
          >
            {filter}
          </Button>
        );
      })}
    </div>
  );
}
