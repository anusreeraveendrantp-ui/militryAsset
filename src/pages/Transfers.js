import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { transfersApi, basesApi, equipmentTypesApi } from '../api/endpoints';
import { Card, CardHeader, CardTitle, CardBody } from '../components/UI/Card';
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import FormField, { Input, Select } from '../components/UI/FormField';
import Pagination from '../components/UI/Pagination';
import Spinner from '../components/UI/Spinner';
import { StatusBadge } from '../components/UI/Badge';
import { useToast } from '../components/UI/Toast';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const categoryIcons = { VEHICLE: '🚗', WEAPON: '🔫', AMMUNITION: '💣', OTHER: '📦' };

export default function Transfers() {
  const { isAdmin, isLogistics, user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const canManage = isAdmin || isLogistics;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', status: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromBaseId: '', toBaseId: '', equipmentTypeId: '', quantity: '', transferDate: new Date().toISOString().split('T')[0] });
  const [formErrors, setFormErrors] = useState({});

  const { data: bases = [] } = useQuery({ queryKey: ['bases'], queryFn: () => basesApi.list().then(r => r.data) });
  const { data: equipmentTypes = [] } = useQuery({ queryKey: ['equipment-types'], queryFn: () => equipmentTypesApi.list().then(r => r.data) });

  const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useQuery({
    queryKey: ['transfers', params],
    queryFn: () => transfersApi.list(params).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => transfersApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] });
      qc.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast('Transfer initiated successfully', 'success');
      setShowForm(false);
      setForm({ fromBaseId: '', toBaseId: '', equipmentTypeId: '', quantity: '', transferDate: new Date().toISOString().split('T')[0] });
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to create transfer', 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => transfersApi.complete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transfers'] }); toast('Transfer marked as completed', 'success'); },
    onError: () => toast('Failed to complete transfer', 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => transfersApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transfers'] }); toast('Transfer cancelled', 'warning'); },
    onError: () => toast('Failed to cancel transfer', 'error'),
  });

  const validate = () => {
    const errors = {};
    if (isAdmin && !form.fromBaseId) errors.fromBaseId = 'Source base is required';
    if (!form.toBaseId) errors.toBaseId = 'Destination base is required';
    if (!form.equipmentTypeId) errors.equipmentTypeId = 'Equipment type is required';
    if (!form.quantity || parseInt(form.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!form.transferDate) errors.transferDate = 'Transfer date is required';
    if (form.fromBaseId && form.fromBaseId === form.toBaseId) errors.toBaseId = 'Source and destination must differ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      ...form,
      fromBaseId: isAdmin ? form.fromBaseId : user.baseId,
      quantity: parseInt(form.quantity),
    });
  };

  const availableDestinations = bases.filter(b => b.id !== (isAdmin ? form.fromBaseId : user?.baseId));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Records</CardTitle>
          {canManage && (
            <Button icon="→" onClick={() => setShowForm(true)}>New Transfer</Button>
          )}
        </CardHeader>

        {/* Filters */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isAdmin && (
            <select value={filters.baseId} onChange={e => setFilters({ ...filters, baseId: e.target.value })}
              style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
              <option value="">All Bases</option>
              {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select value={filters.equipmentTypeId} onChange={e => setFilters({ ...filters, equipmentTypeId: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
            <option value="">All Equipment</option>
            {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
          {Object.values(filters).some(v => v) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ baseId: '', equipmentTypeId: '', status: '', startDate: '', endDate: '' })}>Clear</Button>
          )}
        </div>

        <CardBody style={{ padding: 0 }}>
          {isLoading ? <Spinner center /> : (
            <>
              <Table>
                <Thead>
                  <tr>
                    <Th>Equipment</Th>
                    <Th>From</Th>
                    <Th>To</Th>
                    <Th>Qty</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    {canManage && <Th>Actions</Th>}
                  </tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr><Td style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }} colSpan={7}>No transfers found</Td></Tr>
                  ) : data?.data?.map(t => (
                    <Tr key={t.id}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{categoryIcons[t.equipmentType?.category] || '📦'}</span>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '13px' }}>{t.equipmentType?.name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{t.equipmentType?.category}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          📤 {t.fromBase?.name}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          📥 {t.toBase?.name}
                        </span>
                      </Td>
                      <Td><span style={{ fontWeight: '700', color: '#1e3a5f' }}>{t.quantity.toLocaleString()}</span></Td>
                      <Td style={{ color: '#6b7280', fontSize: '13px' }}>{formatDate(t.transferDate)}</Td>
                      <Td><StatusBadge status={t.status} /></Td>
                      {canManage && (
                        <Td>
                          {t.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Button variant="success" size="sm" loading={completeMutation.isPending} onClick={() => completeMutation.mutate(t.id)}>
                                Complete
                              </Button>
                              <Button variant="danger" size="sm" loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate(t.id)}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {data && (
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
                  <Pagination page={page} total={data.total} limit={15} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setFormErrors({}); }} title="Initiate Transfer">
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <FormField label="From Base" required error={formErrors.fromBaseId}>
              <Select value={form.fromBaseId} onChange={e => setForm({ ...form, fromBaseId: e.target.value })} error={formErrors.fromBaseId}>
                <option value="">Select source base...</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
          )}
          {!isAdmin && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', color: '#0369a1' }}>
              ℹ From: <strong>{user?.base?.name}</strong> (your base)
            </div>
          )}
          <FormField label="To Base" required error={formErrors.toBaseId}>
            <Select value={form.toBaseId} onChange={e => setForm({ ...form, toBaseId: e.target.value })} error={formErrors.toBaseId}>
              <option value="">Select destination base...</option>
              {availableDestinations.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Equipment Type" required error={formErrors.equipmentTypeId}>
            <Select value={form.equipmentTypeId} onChange={e => setForm({ ...form, equipmentTypeId: e.target.value })} error={formErrors.equipmentTypeId}>
              <option value="">Select equipment type...</option>
              {equipmentTypes.map(et => <option key={et.id} value={et.id}>{categoryIcons[et.category]} {et.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Quantity" required error={formErrors.quantity}>
            <Input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="Enter quantity" error={formErrors.quantity} />
          </FormField>
          <FormField label="Transfer Date" required error={formErrors.transferDate}>
            <Input type="date" value={form.transferDate} onChange={e => setForm({ ...form, transferDate: e.target.value })} error={formErrors.transferDate} />
          </FormField>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setShowForm(false)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending} icon="→">Initiate Transfer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
