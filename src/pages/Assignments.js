import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { assignmentsApi, basesApi, equipmentTypesApi } from '../api/endpoints';
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

export default function Assignments() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', assignedTo: '', quantity: '', assignedDate: new Date().toISOString().split('T')[0] });
  const [formErrors, setFormErrors] = useState({});

  const { data: bases = [] } = useQuery({ queryKey: ['bases'], queryFn: () => basesApi.list().then(r => r.data) });
  const { data: equipmentTypes = [] } = useQuery({ queryKey: ['equipment-types'], queryFn: () => equipmentTypesApi.list().then(r => r.data) });

  const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useQuery({
    queryKey: ['assignments', params],
    queryFn: () => assignmentsApi.list(params).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => assignmentsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast('Asset assigned successfully', 'success');
      setShowForm(false);
      setForm({ baseId: '', equipmentTypeId: '', assignedTo: '', quantity: '', assignedDate: new Date().toISOString().split('T')[0] });
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to create assignment', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => assignmentsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); toast('Assignment status updated', 'success'); },
    onError: () => toast('Failed to update status', 'error'),
  });

  const validate = () => {
    const errors = {};
    if (isAdmin && !form.baseId) errors.baseId = 'Base is required';
    if (!form.equipmentTypeId) errors.equipmentTypeId = 'Equipment type is required';
    if (!form.assignedTo.trim()) errors.assignedTo = 'Personnel name/ID is required';
    if (!form.quantity || parseInt(form.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!form.assignedDate) errors.assignedDate = 'Assignment date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({ ...form, baseId: isAdmin ? form.baseId : user.baseId, quantity: parseInt(form.quantity) });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Assignment Records</CardTitle>
          <Button icon="+" onClick={() => setShowForm(true)}>New Assignment</Button>
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
            <option value="ASSIGNED">Assigned</option>
            <option value="RETURNED">Returned</option>
            <option value="EXPENDED">Expended</option>
          </select>
          <select value={filters.equipmentTypeId} onChange={e => setFilters({ ...filters, equipmentTypeId: e.target.value })}
            style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
            <option value="">All Equipment</option>
            {equipmentTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
          </select>
          {Object.values(filters).some(v => v) && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ baseId: '', equipmentTypeId: '', status: '' })}>Clear</Button>
          )}
        </div>

        <CardBody style={{ padding: 0 }}>
          {isLoading ? <Spinner center /> : (
            <>
              <Table>
                <Thead>
                  <tr>
                    <Th>Equipment</Th>
                    <Th>Base</Th>
                    <Th>Assigned To</Th>
                    <Th>Qty</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr><Td style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }} colSpan={7}>No assignments found</Td></Tr>
                  ) : data?.data?.map(a => (
                    <Tr key={a.id}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{categoryIcons[a.equipmentType?.category] || '📦'}</span>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '13px' }}>{a.equipmentType?.name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{a.equipmentType?.category}</div>
                          </div>
                        </div>
                      </Td>
                      <Td style={{ fontSize: '13px' }}>{a.base?.name}</Td>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                            {a.assignedTo?.[0]?.toUpperCase()}
                          </span>
                          <span style={{ fontWeight: '500', fontSize: '13px' }}>{a.assignedTo}</span>
                        </div>
                      </Td>
                      <Td><span style={{ fontWeight: '700', color: '#1e3a5f' }}>{a.quantity}</span></Td>
                      <Td style={{ color: '#6b7280', fontSize: '13px' }}>{formatDate(a.assignedDate)}</Td>
                      <Td><StatusBadge status={a.status} /></Td>
                      <Td>
                        {a.status === 'ASSIGNED' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button variant="secondary" size="sm" onClick={() => statusMutation.mutate({ id: a.id, status: 'RETURNED' })}>
                              Return
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => statusMutation.mutate({ id: a.id, status: 'EXPENDED' })}>
                              Expend
                            </Button>
                          </div>
                        )}
                      </Td>
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
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setFormErrors({}); }} title="New Asset Assignment">
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <FormField label="Base" required error={formErrors.baseId}>
              <Select value={form.baseId} onChange={e => setForm({ ...form, baseId: e.target.value })} error={formErrors.baseId}>
                <option value="">Select base...</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
          )}
          <FormField label="Equipment Type" required error={formErrors.equipmentTypeId}>
            <Select value={form.equipmentTypeId} onChange={e => setForm({ ...form, equipmentTypeId: e.target.value })} error={formErrors.equipmentTypeId}>
              <option value="">Select equipment type...</option>
              {equipmentTypes.map(et => <option key={et.id} value={et.id}>{categoryIcons[et.category]} {et.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Assigned To (Personnel Name / ID)" required error={formErrors.assignedTo}>
            <Input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="e.g. SGT. John Miller" error={formErrors.assignedTo} />
          </FormField>
          <FormField label="Quantity" required error={formErrors.quantity}>
            <Input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="Enter quantity" error={formErrors.quantity} />
          </FormField>
          <FormField label="Assignment Date" required error={formErrors.assignedDate}>
            <Input type="date" value={form.assignedDate} onChange={e => setForm({ ...form, assignedDate: e.target.value })} error={formErrors.assignedDate} />
          </FormField>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setShowForm(false)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Assign Asset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
