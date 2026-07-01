import { useSearch } from "@tanstack/react-router";
import Map from "./maps/map";

const LiveMap = () => {
  const { status, limit, offset } = useSearch({
    from: "/_mainLayout/live-map",
  });
  return (
    <div className="w-full h-full">
      <Map limit={limit} offset={offset} status={status} />
    </div>
  );
};

export default LiveMap;
