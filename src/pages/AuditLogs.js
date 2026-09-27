import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi, usersApi } from '../api/endpoints';
import { Card, CardHeader, CardTitle, CardBody } from '../components/UI/Card';
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Pagination from '../components/UI/Pagination';
import Spinner from '../components/UI/Spinner';
import Modal from '../components/UI/Modal';

function formatDateTime(d) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const methodColors = {
  POST: { bg: '#d1fae5', color: '#065f46' },
  PUT: { bg: '#dbeafe', color: '#1e40af' },
  PATCH: { bg: '#e0e7ff', color: '#3730a3' },
  DELETE: { bg: '#fee2e2', color: '#991b1b' },
  GET: { bg: '#f3f4f6', color: '#374151' },
};

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ userId: '', action: '', startDate: '', endDate: '' });
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then(r => r.data) });

  const params = { page, limit: 30, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.list(params).then(r => r.data),
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>All mutating API operations are logged here</span>
        </CardHeader>

        {/* Filters */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={filters.userId} onChange={e => setFilters({ ...filters, userId: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
            <option value="">All Users</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <input
            type="text"
            placeholder="Filter by action (e.g. CREATE_PURCHASES)..."
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', minWidth: '260px' }}
          />
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
          {Object.values(filters).some(v => v) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ userId: '', action: '', startDate: '', endDate: '' })}>Clear</Button>
          )}
        </div>

        <CardBody style={{ padding: 0 }}>
          {isLoading ? <Spinner center /> : (
            <>
              <Table>
                <Thead>
                  <tr>
                    <Th>Timestamp</Th>
                    <Th>User</Th>
                    <Th>Action</Th>
                    <Th>Method</Th>
                    <Th>Endpoint</Th>
                    <Th>Status</Th>
                    <Th>Payload</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr><Td style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }} colSpan={7}>No audit logs found</Td></Tr>
                  ) : data?.data?.map(log => {
                    const mc = methodColors[log.method] || methodColors.GET;
                    const statusOk = log.statusCode < 400;
                    return (
                      <Tr key={log.id} onClick={() => setSelectedLog(log)}>
                        <Td style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(log.timestamp)}</Td>
                        <Td>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{log.user?.username?.split('@')[0]}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{log.user?.role?.replace('_', ' ')}</div>
                        </Td>
                        <Td>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', color: '#374151' }}>
                            {log.action}
                          </span>
                        </Td>
                        <Td>
                          <span style={{ ...mc, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', fontFamily: 'monospace' }}>
                            {log.method}
                          </span>
                        </Td>
                        <Td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>{log.endpoint}</Td>
                        <Td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: statusOk ? '#d1fae5' : '#fee2e2',
                            color: statusOk ? '#065f46' : '#991b1b',
                            fontFamily: 'monospace',
                          }}>
                            {log.statusCode}
                          </span>
                        </Td>
                        <Td>
                          {log.payload && Object.keys(log.payload).length > 0 ? (
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                              View →
                            </Button>
                          ) : (
                            <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              {data && (
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
                  <Pagination page={page} total={data.total} limit={30} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Payload Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Detail" size="md">
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                ['Action', selectedLog.action],
                ['Method', selectedLog.method],
                ['Endpoint', selectedLog.endpoint],
                ['Status Code', selectedLog.statusCode],
                ['User', selectedLog.user?.username],
                ['Timestamp', formatDateTime(selectedLog.timestamp)],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500', fontFamily: label === 'Action' || label === 'Method' || label === 'Endpoint' ? 'monospace' : 'inherit' }}>
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
            {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Request Payload</div>
                <pre style={{
                  background: '#1f2937',
                  color: '#d1fae5',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  overflowX: 'auto',
                  lineHeight: '1.6',
                  margin: 0,
                }}>
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
