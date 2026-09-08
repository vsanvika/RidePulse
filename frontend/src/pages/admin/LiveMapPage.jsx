import { useEffect, useState } from "react";
import { useSocketStore } from "../../store/socketStore";
import { shuttlesApi, routesApi, stopsApi } from "../../services/dataService";
import CampusMap from "../../components/map/CampusMap";

export default function LiveMapPage() {
  const { initSocket, setInitialShuttles, shuttlesMap } = useSocketStore();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedShuttle, setSelectedShuttle] = useState(null);

  useEffect(() => {
    initSocket();
    Promise.all([shuttlesApi.getAll(), routesApi.getAll(), stopsApi.getAll()]).then(
      ([resS, resR, resSt]) => {
        if (resS.success) setInitialShuttles(resS.data.shuttles);
        if (resR.success) setRoutes(resR.data.routes);
        if (resSt.success) setStops(resSt.data.stops);
      }
    );
  }, []);

  const shuttlesList = Object.values(shuttlesMap);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Real-Time Campus Fleet Map
        </h1>
        <p className="text-xs text-slate-500">
          Full interactive OpenStreetMap tracking real-time vehicle movement
        </p>
      </div>

      <CampusMap
        shuttles={shuttlesList}
        stops={stops}
        routes={routes}
        selectedShuttle={selectedShuttle}
        onSelectShuttle={(s) => setSelectedShuttle(s)}
      />
    </div>
  );
}
