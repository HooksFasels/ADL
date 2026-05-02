import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, Button, Badge } from '@repo/utils/ui';
import { api, type ServiceHealthSnapshot } from '../../services/api';
import { Users, Route as RouteIcon, Bus as BusIcon, Activity } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;

const INITIAL_SERVICE_HEALTH: ServiceHealthSnapshot = {
  status: 'DOWN',
  module: 'ADL-API',
  service: 'api',
  timestamp: '',
};

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const [stats, setStats] = useState({ drivers: 0, routes: 0, vehicles: 0 });
  const [apiHealth, setApiHealth] = useState<ServiceHealthSnapshot>(INITIAL_SERVICE_HEALTH);
  const [databaseHealth, setDatabaseHealth] = useState<ServiceHealthSnapshot>({
    ...INITIAL_SERVICE_HEALTH,
    service: 'database',
  });
  const [redisHealth, setRedisHealth] = useState<ServiceHealthSnapshot>({
    ...INITIAL_SERVICE_HEALTH,
    service: 'redis',
  });
  const [kafkaHealth, setKafkaHealth] = useState<ServiceHealthSnapshot>({
    ...INITIAL_SERVICE_HEALTH,
    service: 'kafka',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setIsRefreshing(true);

      try {
        const [driversResult, routesResult, vehiclesResult, apiResult, databaseResult, redisResult, kafkaResult] =
          await Promise.allSettled([
          api.getDrivers(),
          api.getRoutes(),
          api.getBuses(),
          api.getApiHealth(),
          api.getDatabaseHealth(),
          api.getRedisHealth(),
          api.getKafkaHealth(),
        ]);

        if (cancelled) return;

        if (driversResult.status === 'fulfilled' && driversResult.value.success) {
          setStats((current) => ({
            ...current,
            drivers: driversResult.value.data?.length || 0,
          }));
        }

        if (routesResult.status === 'fulfilled' && routesResult.value.success) {
          setStats((current) => ({
            ...current,
            routes: routesResult.value.data?.length || 0,
          }));
        }

        if (vehiclesResult.status === 'fulfilled' && vehiclesResult.value.success) {
          setStats((current) => ({
            ...current,
            vehicles: vehiclesResult.value.data?.length || 0,
          }));
        }

        if (apiResult.status === 'fulfilled') {
          setApiHealth(apiResult.value);
        } else {
          setApiHealth({
            ...INITIAL_SERVICE_HEALTH,
            service: 'api',
            timestamp: new Date().toISOString(),
          });
        }

        if (databaseResult.status === 'fulfilled') {
          setDatabaseHealth(databaseResult.value);
        } else {
          setDatabaseHealth({
            ...INITIAL_SERVICE_HEALTH,
            service: 'database',
            timestamp: new Date().toISOString(),
          });
        }

        if (redisResult.status === 'fulfilled') {
          setRedisHealth(redisResult.value);
        } else {
          setRedisHealth({
            ...INITIAL_SERVICE_HEALTH,
            service: 'redis',
            timestamp: new Date().toISOString(),
          });
        }

        if (kafkaResult.status === 'fulfilled') {
          setKafkaHealth(kafkaResult.value);
        } else {
          setKafkaHealth({
            ...INITIAL_SERVICE_HEALTH,
            service: 'kafka',
            timestamp: new Date().toISOString(),
          });
        }

        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to fetch system stats', err);
        const now = new Date().toISOString();
        setApiHealth({ ...INITIAL_SERVICE_HEALTH, service: 'api', timestamp: now });
        setDatabaseHealth({ ...INITIAL_SERVICE_HEALTH, service: 'database', timestamp: now });
        setRedisHealth({ ...INITIAL_SERVICE_HEALTH, service: 'redis', timestamp: now });
        setKafkaHealth({ ...INITIAL_SERVICE_HEALTH, service: 'kafka', timestamp: now });
        setLastUpdated(new Date().toLocaleTimeString());
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    };

    void fetchStats();
    const intervalId = window.setInterval(() => {
      void fetchStats();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Admin Dashboard</h2>
          <p className="text-gray-500">
            Live resource counts refreshed every {POLL_INTERVAL_MS / 1000} seconds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              apiHealth.status === 'UP' &&
              databaseHealth.status === 'UP' &&
              redisHealth.status === 'UP'
                ? 'success'
                : 'warning'
            }
          >
            {apiHealth.status === 'UP' &&
            databaseHealth.status === 'UP' &&
            redisHealth.status === 'UP'
              ? 'UP'
              : 'DEGRADED'}
          </Badge>
          <span className="text-xs text-gray-500">
            {isRefreshing
              ? 'Refreshing now'
              : lastUpdated
                ? `Last updated ${lastUpdated}`
                : 'Waiting for first refresh'}
          </span>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Drivers</p>
            <p className="text-2xl font-bold">{stats.drivers}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <RouteIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Routes</p>
            <p className="text-2xl font-bold">{stats.routes}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <BusIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-bold">{stats.vehicles}</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="text-green-600" /> System Health
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <span>API Server</span>
            <Badge variant={apiHealth.status === 'UP' ? 'success' : 'danger'}>
              {apiHealth.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <span>Database</span>
            <Badge variant={databaseHealth.status === 'UP' ? 'success' : 'danger'}>
              {databaseHealth.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <span>Redis</span>
            <Badge variant={redisHealth.status === 'UP' ? 'success' : 'danger'}>
              {redisHealth.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <span>Kafka</span>
            <Badge variant={kafkaHealth.status === 'UP' ? 'success' : 'warning'}>
              {kafkaHealth.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
            <span>Dashboard Polling</span>
            <Badge variant={isRefreshing ? 'warning' : 'success'}>
              {isRefreshing ? 'Refreshing' : `Every ${POLL_INTERVAL_MS / 1000}s`}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
