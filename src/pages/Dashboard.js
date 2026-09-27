import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, basesApi, equipmentTypesApi } from '../api/endpoints';
import StatCard from '../components/UI/StatCard';
import { Card, CardHeader, CardTitle, CardBody } from '../components/UI/Card';
import Spinner from '../components/UI/Spinner';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';

const PIE_COLORS = ['#1e3a5f', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [filters, setFilters] = useState({
    baseId: isAdmin ? '' : user?.baseId || '',
    startDate: formatDate(firstDay),
    endDate: formatDate(today),
    equipmentTypeId: '',
  });
  const [netMovementBase, setNetMovementBase] = useState(null);
  const [showNetModal, setShowNetModal] = useState(false);

  const { data: bases = [] } = useQuery({
    queryKey: ['bases'],
    queryFn: () => basesApi.list().then((r) => r.data),
  });

  const { data: equipmentTypes = [] } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: () => equipmentTypesApi.list().then((r) => r.data),
  });

  const metricsParams = {
    ...(filters.baseId && { baseId: filters.baseId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.equipmentTypeId && { equipmentTypeId: filters.equipmentTypeId }),
  };

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics', metricsParams],
    queryFn: () => dashboardApi.getMetrics(metricsParams).then((r) => r.data),
  });

  const { data: netMovementData = [], isLoading: netLoading } = useQuery({
    queryKey: ['net-movement', netMovementBase, filters.startDate, filters.endDate],
    queryFn: () =>
      dashboardApi
        .getNetMovement(netMovementBase, { startDate: filters.startDate, endDate: filters.endDate })
        .then((r) => r.data),
    enabled: !!netMovementBase && showNetModal,
  });

  const openNetMovement = (baseId) => {
    setNetMovementBase(baseId);
    setShowNetModal(true);
  };

  const pieData = metrics
    ? [
        { name: 'Purchases', value: metrics.purchases, color: '#2563eb' },
        { name: 'Transfers In', value: metrics.transfersIn, color: '#10b981' },
        { name: 'Transfers Out', value: metrics.transfersOut, color: '#f59e0b' },
        { name: 'Assigned', value: metrics.assigned, color: '#8b5cf6' },
        { name: 'Expended', value: metrics.expended, color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <CardBody style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {isAdmin && (
              <div style={{ flex: '1', minWidth: '160px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Base</label>
                <select
                  value={filters.baseId}
                  onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="">All Bases</option>
                  {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ flex: '1', minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Equipment Type</label>
              <select
                value={filters.equipmentTypeId}
                onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
              >
                <option value="">All Types</option>
                {equipmentTypes.map((et) => <option key={et.id} value={et.id}>{et.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stat Cards */}
      {metricsLoading ? (
        <Spinner center />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard title="Opening Balance" value={metrics?.openingBalance ?? 0} icon="📦" color="#6b7280" subtitle="Start of period" />
            <StatCard title="Purchases" value={metrics?.purchases ?? 0} icon="🛒" color="#2563eb" subtitle="Assets acquired" />
            <StatCard title="Transfers In" value={metrics?.transfersIn ?? 0} icon="📥" color="#10b981" subtitle="Received from other bases" />
            <StatCard title="Transfers Out" value={metrics?.transfersOut ?? 0} icon="📤" color="#f59e0b" subtitle="Sent to other bases" />
            <StatCard title="Net Movement" value={metrics?.netMovement ?? 0} icon="📊" color="#1e3a5f" trend={metrics?.netMovement ?? 0} />
            <StatCard title="Assigned" value={metrics?.assigned ?? 0} icon="👤" color="#8b5cf6" subtitle="Currently assigned" />
            <StatCard title="Expended" value={metrics?.expended ?? 0} icon="💥" color="#ef4444" subtitle="Consumed / lost" />
            <StatCard title="Closing Balance" value={metrics?.closingBalance ?? 0} icon="🏁" color="#1e3a5f" subtitle="End of period" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Flow Overview</CardTitle>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={[
                    { name: 'Purchases', value: metrics?.purchases ?? 0 },
                    { name: 'Trans. In', value: metrics?.transfersIn ?? 0 },
                    { name: 'Trans. Out', value: metrics?.transfersOut ?? 0 },
                    { name: 'Assigned', value: metrics?.assigned ?? 0 },
                    { name: 'Expended', value: metrics?.expended ?? 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardBody>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    No data for selected period
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Net Movement Per Base (Admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Net Movement by Base</CardTitle>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Click a base to see equipment breakdown</span>
              </CardHeader>
              <CardBody style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {['Base', 'Location', 'Action'].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bases.map((base) => (
                      <tr key={base.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>📍 {base.name}</td>
                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{base.location}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <Button size="sm" variant="secondary" onClick={() => openNetMovement(base.id)}>
                            View Breakdown →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}

          {/* Non-admin: own base net movement button */}
          {!isAdmin && user?.baseId && (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => openNetMovement(user.baseId)} icon="📊">
                View My Base Net Movement Breakdown
              </Button>
            </div>
          )}
        </>
      )}

      {/* Net Movement Modal */}
      <Modal isOpen={showNetModal} onClose={() => setShowNetModal(false)} title="Net Movement Breakdown" size="lg">
        {netLoading ? (
          <Spinner center />
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Period: {filters.startDate} → {filters.endDate}
            </p>
            {netMovementData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No movement data found for this period.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {['Equipment', 'Category', 'Purchases', 'Trans. In', 'Trans. Out', 'Net Movement', 'Expended', 'Closing Balance'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {netMovementData.map((row) => (
                      <tr key={row.equipmentTypeId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{row.equipmentTypeName}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                            {row.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#2563eb', fontWeight: '600' }}>{row.purchases}</td>
                        <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: '600' }}>+{row.transfersIn}</td>
                        <td style={{ padding: '10px 12px', color: '#f59e0b', fontWeight: '600' }}>-{row.transfersOut}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ color: row.netMovement >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                            {row.netMovement >= 0 ? '+' : ''}{row.netMovement}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: '600' }}>{row.expended}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1f2937' }}>{row.closingBalance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
