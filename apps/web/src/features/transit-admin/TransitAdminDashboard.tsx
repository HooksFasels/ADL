import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Users, Route as RouteIcon, Bus, MapPin, Link2, XCircle, LogOut } from 'lucide-react';

type Tab = 'drivers' | 'routes' | 'stops' | 'vehicles' | 'assignments';
type Flash = { type: 'success' | 'error'; text: string } | null;

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'drivers', label: 'Drivers', icon: <Users size={16} /> },
  { id: 'routes', label: 'Routes', icon: <RouteIcon size={16} /> },
  { id: 'stops', label: 'Stops', icon: <MapPin size={16} /> },
  { id: 'vehicles', label: 'Vehicles', icon: <Bus size={16} /> },
  { id: 'assignments', label: 'Assignments', icon: <Link2 size={16} /> },
];

export default function TransitAdminDashboard() {
  const { logout } = useAuthStore();
  const [tab, setTab] = useState<Tab>('drivers');
  const [flash, setFlash] = useState<Flash>(null);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [driverForm, setDriverForm] = useState({ name: '', email: '', password: '', phone: '', licenseNo: '', assignedRouteId: '' });
  const [routeForm, setRouteForm] = useState({ code: '', name: '', city: '' });
  const [stopForm, setStopForm] = useState({ routeId: '', name: '', latitude: '', longitude: '', sequence: '' });
  const [vehicleForm, setVehicleForm] = useState({ registration: '', type: '', capacity: '40', status: 'ACTIVE' });
  const [assignForm, setAssignForm] = useState({ driverId: '', vehicleId: '', routeId: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [d, r, v, a] = await Promise.allSettled([
      api.getDrivers(), api.getRoutes(), api.getBuses(), api.getAssignments(),
    ]);
    if (d.status === 'fulfilled' && d.value.success) setDrivers(d.value.data ?? []);
    if (r.status === 'fulfilled' && r.value.success) setRoutes(r.value.data ?? []);
    if (v.status === 'fulfilled' && v.value.success) setVehicles(v.value.data ?? []);
    if (a.status === 'fulfilled' && a.value.success) setAssignments(a.value.data ?? []);
  };

  const msg = (type: 'success' | 'error', text: string) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const onCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDriver(driverForm);
      if (res.success) { msg('success', 'Driver created'); setDriverForm({ name: '', email: '', password: '', phone: '', licenseNo: '', assignedRouteId: '' }); fetchAll(); }
    } catch (err: any) { msg('error', err.response?.data?.message || err.message || 'Failed to create driver'); }
  };

  const onCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminRoute(routeForm);
      if (res.success) { msg('success', 'Route created'); setRouteForm({ code: '', name: '', city: '' }); fetchAll(); }
    } catch (err: any) { msg('error', err.response?.data?.message || err.message || 'Failed to create route'); }
  };

  const onCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminStop(stopForm);
      if (res.success) { msg('success', 'Stop added'); setStopForm({ routeId: '', name: '', latitude: '', longitude: '', sequence: '' }); fetchAll(); }
    } catch (err: any) { msg('error', err.response?.data?.message || err.message || 'Failed to add stop'); }
  };

  const onCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createVehicle(vehicleForm);
      if (res.success) { msg('success', 'Vehicle added'); setVehicleForm({ registration: '', type: '', capacity: '40', status: 'ACTIVE' }); fetchAll(); }
    } catch (err: any) { msg('error', err.response?.data?.message || err.message || 'Failed to add vehicle'); }
  };

  const onCreateAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.driverId || !assignForm.vehicleId || !assignForm.routeId) {
      msg('error', 'Select driver, vehicle, and route'); return;
    }
    try {
      const res = await api.createAssignment({ ...assignForm, startDate: new Date().toISOString() });
      if (res.success) { msg('success', 'Assignment created'); setAssignForm({ driverId: '', vehicleId: '', routeId: '' }); fetchAll(); }
    } catch (err: any) { msg('error', err.response?.data?.error || 'Failed to create assignment'); }
  };

  const onEndAssign = async (id: string) => {
    try {
      await api.endAssignment(id);
      msg('success', 'Assignment ended');
      fetchAll();
    } catch { msg('error', 'Failed to end assignment'); }
  };

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const sel = `${inp} bg-white`;
  const btn = (color: string) => `w-full py-2 px-4 rounded-lg text-white text-sm font-semibold ${color} hover:opacity-90 transition`;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Transit Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage fleet, drivers, routes and assignments</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6 flex gap-1 shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Flash */}
      {flash && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium shrink-0 ${
          flash.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {flash.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex gap-6">

          {/* ── DRIVERS ── */}
          {tab === 'drivers' && (
            <>
              <div className="w-80 shrink-0 bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 overflow-y-auto">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Users size={16} className="text-blue-600" /> New Driver</h2>
                <form onSubmit={onCreateDriver} className="flex flex-col gap-2">
                  <input className={inp} placeholder="Full Name" value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Email" value={driverForm.email} onChange={e => setDriverForm({ ...driverForm, email: e.currentTarget.value })} required />
                  <input type="password" className={inp} placeholder="Password" value={driverForm.password} onChange={e => setDriverForm({ ...driverForm, password: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Phone (optional)" value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.currentTarget.value })} />
                  <input className={inp} placeholder="License No (optional)" value={driverForm.licenseNo} onChange={e => setDriverForm({ ...driverForm, licenseNo: e.currentTarget.value })} />
                  <select className={sel} value={driverForm.assignedRouteId} onChange={e => setDriverForm({ ...driverForm, assignedRouteId: e.currentTarget.value })}>
                    <option value="">No route assigned</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.code} – {r.name}</option>)}
                  </select>
                  <button type="submit" className={btn('bg-blue-600 mt-1')}>Register Driver</button>
                </form>
              </div>
              <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                    <tr>{['Name', 'Email', 'Phone', 'License', 'Route', 'Active'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {drivers.length === 0
                      ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No drivers yet</td></tr>
                      : drivers.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{d.user?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{d.user?.email ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{d.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500">{d.licenseNo ?? '—'}</td>
                          <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{d.assignedRoute?.code ?? 'None'}</span></td>
                          <td className="px-4 py-3"><span className={`w-2 h-2 rounded-full inline-block ${d.user?.isActive ? 'bg-green-500' : 'bg-gray-400'}`} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ROUTES ── */}
          {tab === 'routes' && (
            <>
              <div className="w-72 shrink-0 bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><RouteIcon size={16} className="text-purple-600" /> New Route</h2>
                <form onSubmit={onCreateRoute} className="flex flex-col gap-2">
                  <input className={inp} placeholder="Code (e.g. 101)" value={routeForm.code} onChange={e => setRouteForm({ ...routeForm, code: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Route Name" value={routeForm.name} onChange={e => setRouteForm({ ...routeForm, name: e.currentTarget.value })} required />
                  <input className={inp} placeholder="City" value={routeForm.city} onChange={e => setRouteForm({ ...routeForm, city: e.currentTarget.value })} required />
                  <button type="submit" className={btn('bg-purple-600 mt-1')}>Create Route</button>
                </form>
              </div>
              <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                    <tr>{['Code', 'Name', 'City', 'Stops'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {routes.length === 0
                      ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No routes yet</td></tr>
                      : routes.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-black text-blue-600">{r.code}</td>
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3 text-gray-500">{r.city}</td>
                          <td className="px-4 py-3 font-bold text-center">{r._count?.stops ?? r.stops?.length ?? 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STOPS ── */}
          {tab === 'stops' && (
            <>
              <div className="w-72 shrink-0 bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-red-600" /> New Stop</h2>
                <form onSubmit={onCreateStop} className="flex flex-col gap-2">
                  <select className={sel} value={stopForm.routeId} onChange={e => setStopForm({ ...stopForm, routeId: e.currentTarget.value })} required>
                    <option value="">Select Route</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.code} – {r.name}</option>)}
                  </select>
                  <input className={inp} placeholder="Stop Name" value={stopForm.name} onChange={e => setStopForm({ ...stopForm, name: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Latitude" value={stopForm.latitude} onChange={e => setStopForm({ ...stopForm, latitude: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Longitude" value={stopForm.longitude} onChange={e => setStopForm({ ...stopForm, longitude: e.currentTarget.value })} required />
                  <input type="number" className={inp} placeholder="Sequence (1, 2, 3…)" value={stopForm.sequence} onChange={e => setStopForm({ ...stopForm, sequence: e.currentTarget.value })} required />
                  <button type="submit" className={btn('bg-red-600 mt-1')}>Add Stop</button>
                </form>
              </div>
              <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                    <tr>{['Route', 'Stop Name', 'Latitude', 'Longitude', 'Seq'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {routes.flatMap(r => (r.stops ?? []).map((s: any) => ({ ...s, routeCode: r.code }))).length === 0
                      ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No stops yet</td></tr>
                      : routes.flatMap(r => (r.stops ?? []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{r.code}</span></td>
                          <td className="px-4 py-3 font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.latitude}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.longitude}</td>
                          <td className="px-4 py-3 text-center font-bold">{s.sequence}</td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── VEHICLES ── */}
          {tab === 'vehicles' && (
            <>
              <div className="w-72 shrink-0 bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Bus size={16} className="text-orange-600" /> New Vehicle</h2>
                <form onSubmit={onCreateVehicle} className="flex flex-col gap-2">
                  <input className={inp} placeholder="Registration No." value={vehicleForm.registration} onChange={e => setVehicleForm({ ...vehicleForm, registration: e.currentTarget.value })} required />
                  <input className={inp} placeholder="Type (AC / Non-AC / Sleeper)" value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.currentTarget.value })} required />
                  <input type="number" className={inp} placeholder="Capacity" value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: e.currentTarget.value })} required />
                  <select className={sel} value={vehicleForm.status} onChange={e => setVehicleForm({ ...vehicleForm, status: e.currentTarget.value })}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  <button type="submit" className={btn('bg-orange-600 mt-1')}>Add Vehicle</button>
                </form>
              </div>
              <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                    <tr>{['Reg No', 'Type', 'Capacity', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehicles.length === 0
                      ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No vehicles yet</td></tr>
                      : vehicles.map(v => (
                        <tr key={v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold">{v.registration}</td>
                          <td className="px-4 py-3 text-gray-600">{v.type}</td>
                          <td className="px-4 py-3">{v.capacity}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              v.status === 'ACTIVE' ? 'bg-green-100 text-green-700'
                              : v.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}>{v.status}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ASSIGNMENTS ── */}
          {tab === 'assignments' && (
            <>
              <div className="w-80 shrink-0 bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><Link2 size={16} className="text-emerald-600" /> New Assignment</h2>
                <form onSubmit={onCreateAssign} className="flex flex-col gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Driver</label>
                    <select className={sel} value={assignForm.driverId} onChange={e => setAssignForm({ ...assignForm, driverId: e.currentTarget.value })} required>
                      <option value="">Select driver</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.user?.name ?? d.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Vehicle</label>
                    <select className={sel} value={assignForm.vehicleId} onChange={e => setAssignForm({ ...assignForm, vehicleId: e.currentTarget.value })} required>
                      <option value="">Select vehicle</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration} ({v.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Route</label>
                    <select className={sel} value={assignForm.routeId} onChange={e => setAssignForm({ ...assignForm, routeId: e.currentTarget.value })} required>
                      <option value="">Select route</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.code} – {r.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className={btn('bg-emerald-600 mt-2')}>Assign Now</button>
                </form>
              </div>
              <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0">
                    <tr>{['Driver', 'Vehicle', 'Route', 'Started', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignments.length === 0
                      ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No assignments yet. Use the form to assign a driver.</td></tr>
                      : assignments.map(a => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{a.driver?.user?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{a.vehicle?.registration ?? '—'}</td>
                          <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{a.route?.code}</span></td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.startDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${!a.endDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {!a.endDate ? 'Active' : 'Ended'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {!a.endDate && (
                              <button onClick={() => onEndAssign(a.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium">
                                <XCircle size={13} /> End
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
