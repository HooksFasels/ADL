import axios from 'axios';
import type { ApiResponse, Route, Stop, Bus } from '@repo/utils/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3009';

export interface HealthSnapshot {
  status: 'UP' | 'DEGRADED';
  module: string;
  services: {
    api: 'UP' | 'DOWN';
    database: 'UP' | 'DOWN';
    redis: 'UP' | 'DOWN';
    kafka: 'UP' | 'DOWN';
  };
  timestamp: string;
}

export interface DatabaseHealthSnapshot {
  status: 'UP' | 'DOWN';
  module: string;
  service: 'database';
  timestamp: string;
}

export interface ServiceHealthSnapshot {
  status: 'UP' | 'DOWN';
  module: string;
  service: 'api' | 'database' | 'redis' | 'kafka';
  timestamp: string;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async () => {
    try {
      const response = await client.get<HealthSnapshot>('/health', { validateStatus: () => true });
      return response.data;
    } catch {
      return {
        status: 'DEGRADED',
        module: 'ADL-API',
        services: {
          api: 'DOWN',
          database: 'DOWN',
          redis: 'DOWN',
          kafka: 'DOWN',
        },
        timestamp: new Date().toISOString(),
      } satisfies HealthSnapshot;
    }
  },
  getApiHealth: async () => {
    try {
      const response = await client.get<ServiceHealthSnapshot>('/health/api', {
        validateStatus: () => true,
      });
      return response.data;
    } catch {
      return {
        status: 'DOWN',
        module: 'ADL-API',
        service: 'api',
        timestamp: new Date().toISOString(),
      } satisfies ServiceHealthSnapshot;
    }
  },
  getDatabaseHealth: async () => {
    try {
      const response = await client.get<DatabaseHealthSnapshot>('/health/database', {
        validateStatus: () => true,
      });
      return response.data;
    } catch {
      return {
        status: 'DOWN',
        module: 'ADL-API',
        service: 'database',
        timestamp: new Date().toISOString(),
      } satisfies DatabaseHealthSnapshot;
    }
  },
  getRedisHealth: async () => {
    try {
      const response = await client.get<ServiceHealthSnapshot>('/health/redis', {
        validateStatus: () => true,
      });
      return response.data;
    } catch {
      return {
        status: 'DOWN',
        module: 'ADL-API',
        service: 'redis',
        timestamp: new Date().toISOString(),
      } satisfies ServiceHealthSnapshot;
    }
  },
  getKafkaHealth: async () => {
    try {
      const response = await client.get<ServiceHealthSnapshot>('/health/kafka', {
        validateStatus: () => true,
      });
      return response.data;
    } catch {
      return {
        status: 'DOWN',
        module: 'ADL-API',
        service: 'kafka',
        timestamp: new Date().toISOString(),
      } satisfies ServiceHealthSnapshot;
    }
  },

  login: (data: any) => client.post<ApiResponse<any>>('/api/v1/auth/login', data).then((r) => r.data),
  getRoutes: () => client.get<ApiResponse<Route[]>>('/api/v1/routes').then((r) => r.data),
  getStops: () => client.get<ApiResponse<Stop[]>>('/api/v1/stops').then((r) => r.data),
  getActiveBuses: () => client.get<ApiResponse<Bus[]>>('/api/v1/buses/active').then((r) => r.data),
  getAssignmentByDriverId: (driverId: string) =>
    client.get<ApiResponse<any>>(`/api/v1/assignments/active?driverId=${driverId}`).then((r) => r.data),
  updateLocation: (data: {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    stopsCrossed?: number;
    status?: string;
  }) => client.post('/api/v1/location/update', data).then((r) => r.data),

  createDriver: (data: any) => client.post<ApiResponse<any>>('/api/v1/admin/drivers', data).then((r) => r.data),
  getDrivers: () => client.get<ApiResponse<any[]>>('/api/v1/admin/drivers').then((r) => r.data),
  deleteDriver: (id: string) => client.delete<ApiResponse<any>>(`/api/v1/admin/drivers/${id}`).then((r) => r.data),

  createAdminRoute: (data: any) => client.post<ApiResponse<any>>('/api/v1/admin/routes', data).then((r) => r.data),
  deleteAdminRoute: (id: string) => client.delete<ApiResponse<any>>(`/api/v1/admin/routes/${id}`).then((r) => r.data),
  createAdminStop: (data: any) => client.post<ApiResponse<any>>('/api/v1/admin/stops', data).then((r) => r.data),
  deleteAdminStop: (id: string) => client.delete<ApiResponse<any>>(`/api/v1/admin/stops/${id}`).then((r) => r.data),

  getBuses: () => client.get<ApiResponse<Bus[]>>('/api/v1/buses/buses').then((r) => r.data),
  createVehicle: (data: { registration: string; type: string; capacity: string | number; status: string }) =>
    client.post<ApiResponse<Bus>>('/api/v1/buses/buses', data).then((r) => r.data),
  deleteVehicle: (id: string) => client.delete<ApiResponse<any>>(`/api/v1/buses/buses/${id}`).then((r) => r.data),

  getBuses: () => client.get<ApiResponse<Bus[]>>('/api/v1/buses/buses').then((r) => r.data),
  createVehicle: (data: {
    registration: string;
    type: string;
    capacity: string | number;
    status: string;
  }) => client.post<ApiResponse<Bus>>('/api/v1/buses/buses', data).then((r) => r.data),

  getAssignments: () => client.get<ApiResponse<any[]>>('/api/v1/admin/assignments').then((r) => r.data),
  createAssignment: (data: {
    driverId: string;
    vehicleId: string;
    routeId: string;
    startDate?: string;
  }) => client.post<ApiResponse<any>>('/api/v1/admin/assignments', data).then((r) => r.data),
  endAssignment: (id: string) =>
    client.patch<ApiResponse<any>>(`/api/v1/admin/assignments/${id}/end`, {}).then((r) => r.data),
  deleteAssignment: (id: string) => client.delete<ApiResponse<any>>(`/api/v1/admin/assignments/${id}`).then((r) => r.data),

  startTrip: (data: { vehicleId: string; routeId: string }) =>
    client.post<ApiResponse<any>>('/api/v1/trips/start', data).then((r) => r.data),
  endTrip: (id: string) => client.patch<ApiResponse<any>>(`/api/v1/trips/${id}/end`, {}).then((r) => r.data),
};
