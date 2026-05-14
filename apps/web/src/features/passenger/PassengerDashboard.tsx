import { useEffect, useState } from 'react';
import MapView from './MapView';
import { useRouteStore } from '../../store/useRouteStore';
import { useBusStore } from '../../store/useBusStore';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { SearchInput, Card, Badge, Spinner } from '@repo/utils/ui';
import { X, Search as SearchIcon, Map as MapIcon, List as ListIcon } from 'lucide-react';

export default function PassengerDashboard() {
  const { routes, setRoutes, selectedRouteId, setSelectedRoute, isLoading, setLoading } = useRouteStore();
  const { locations, updateLocation } = useBusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const res = await api.getRoutes();
        if (res.success) setRoutes(res.data);
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveBuses = async () => {
      try {
        const res = await api.getActiveBuses();
        if (res.success && res.data) {
          res.data.forEach((bus: any) => {
            updateLocation({
              vehicleId: bus.vehicleId,
              latitude: bus.latitude,
              longitude: bus.longitude,
              speed: bus.speed,
              recordedAt: bus.recordedAt,
              tripId: bus.tripId,
              registration: bus.registration,
              status: bus.status,
              stopsCrossed: bus.stopsCrossed,
            });
          });
        }
      } catch (err) {
        console.error('Failed to fetch active buses', err);
      }
    };

    fetchRoutes();
    fetchActiveBuses();

    // Connect to real-time WebSocket
    realtime.connect();

    return () => {
      realtime.disconnect();
    };
  }, []);

  // Subscribe to selected route
  useEffect(() => {
    if (selectedRouteId) realtime.subscribeToRoute(selectedRouteId);
    return () => {
      if (selectedRouteId) realtime.unsubscribeFromRoute(selectedRouteId);
    };
  }, [selectedRouteId]);

  // Check for stale locations (driver unreachable)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const STALE_THRESHOLD = 10000; // 10 seconds

      Object.values(locations).forEach(loc => {
        if (loc.recordedAt && loc.status !== 'DRIVER UNREACHABLE') {
          const recordedTime = new Date(loc.recordedAt).getTime();
          if (now - recordedTime > STALE_THRESHOLD) {
            updateLocation({
              ...loc,
              status: 'DRIVER UNREACHABLE',
              speed: 0
            });
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [locations, updateLocation]);

  const filteredRoutes = routes.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      (r.startLocation?.toLowerCase().includes(q) ?? false) ||
      (r.destinationLocation?.toLowerCase().includes(q) ?? false)
    );
  });

  const activeBusCount = locations ? Object.keys(locations).length : 0;

  return (
    <div className="flex flex-col md:flex-row flex-1 h-full w-full min-h-0 overflow-hidden relative bg-white">
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-6 right-6 z-[1001] bg-blue-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-all flex items-center justify-center"
        >
          {isSidebarOpen ? <MapIcon size={24} /> : <ListIcon size={24} />}
        </button>
      )}

      {/* Sidebar Overlay for Mobile / Fixed for Desktop */}
      <div 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative top-0 left-0 h-full w-full md:w-80 md:min-w-[320px] bg-white md:bg-gray-50 
          border-r border-gray-200 flex flex-col p-4 md:p-6 gap-5 overflow-y-auto 
          transition-transform duration-300 ease-in-out z-[1000] md:z-10
        `}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Find Your Route</h2>
            <p className="text-xs font-medium text-blue-600 mt-0.5">
              {activeBusCount} bus{activeBusCount !== 1 ? 'es' : ''} live now
            </p>
          </div>
          {isMobile && (
             <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400">
               <X size={20} />
             </button>
          )}
        </div>

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(typeof e === 'string' ? e : (e as any).target?.value ?? '')}
          placeholder="Enter route code or location..."
        />

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center p-12"><Spinner /></div>
          ) : !filteredRoutes || filteredRoutes.length === 0 ? (
            <div className="text-center p-12 bg-gray-100 rounded-2xl border border-dashed border-gray-300">
              <SearchIcon size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No routes found matching your search.</p>
            </div>
          ) : (
            filteredRoutes.map(route => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all border-2 duration-200 hover:shadow-md ${selectedRouteId === route.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-transparent hover:border-blue-200'}`}
                onClick={() => {
                  setSelectedRoute(selectedRouteId === route.id ? null : route.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-wider">
                        {route.code}
                      </span>
                      <Badge variant="success">Live</Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {route.startLocation} 
                      <span className="mx-1 text-gray-400 font-normal">→</span> 
                      {route.destinationLocation}
                    </h3>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                    <MapIcon size={16} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Active buses on selected route detail card */}
        {selectedRouteId && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl text-white">
              <h4 className="font-bold mb-3 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Tracker
              </h4>
              <div className="space-y-2.5">
                {Object.values(locations).filter(loc => loc.routeId === selectedRouteId).length === 0 ? (
                  <p className="text-xs text-blue-100 opacity-80">Monitoring this route for active buses...</p>
                ) : (
                  Object.values(locations).filter(loc => loc.routeId === selectedRouteId).map(loc => (
                    <div key={loc.vehicleId} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 flex justify-between items-center border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="font-mono font-bold text-xs">{loc.registration ?? loc.vehicleId}</span>
                      </div>
                      <span className="font-mono text-[10px] font-black bg-white/20 px-2 py-0.5 rounded">
                        {(loc.speed ?? 0).toFixed(0)} KM/H
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full w-full z-0 min-h-0">
        <MapView />
      </div>
    </div>
  );
}
