import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { purchasesApi, basesApi, equipmentTypesApi } from '../api/endpoints';
import { Card, CardHeader, CardTitle, CardBody } from '../components/UI/Card';
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import FormField, { Input, Select } from '../components/UI/FormField';
import Pagination from '../components/UI/Pagination';
import Spinner from '../components/UI/Spinner';
import { useToast } from '../components/UI/Toast';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const categoryIcons = { VEHICLE: '🚗', WEAPON: '🔫', AMMUNITION: '💣', OTHER: '📦' };

export default function Purchases() {
  const { isAdmin, isLogistics, user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const canCreate = isAdmin || isLogistics;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', purchaseDate: new Date().toISOString().split('T')[0] });
  const [formErrors, setFormErrors] = useState({});

  const { data: bases = [] } = useQuery({ queryKey: ['bases'], queryFn: () => basesApi.list().then(r => r.data) });
  const { data: equipmentTypes = [] } = useQuery({ queryKey: ['equipment-types'], queryFn: () => equipmentTypesApi.list().then(r => r.data) });

  const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchasesApi.list(params).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => purchasesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast('Purchase recorded successfully', 'success');
      setShowForm(false);
      setForm({ baseId: '', equipmentTypeId: '', quantity: '', purchaseDate: new Date().toISOString().split('T')[0] });
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to create purchase', 'error'),
  });

  const validate = () => {
    const errors = {};
    if (!form.equipmentTypeId) errors.equipmentTypeId = 'Equipment type is required';
    if (!form.quantity || parseInt(form.quantity) <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!form.purchaseDate) errors.purchaseDate = 'Purchase date is required';
    if (isAdmin && !form.baseId) errors.baseId = 'Base is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      baseId: isAdmin ? form.baseId : user.baseId,
      quantity: parseInt(form.quantity),
    };
    createMutation.mutate(payload);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Records</CardTitle>
          <div style={{ display: 'flex', gap: '8px' }}>
            {canCreate && (
              <Button icon="+" onClick={() => setShowForm(true)}>New Purchase</Button>
            )}
          </div>
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
            <Button variant="ghost" size="sm" onClick={() => setFilters({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' })}>Clear</Button>
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
                    <Th>Quantity</Th>
                    <Th>Date</Th>
                    <Th>Recorded By</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr><Td style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }} colSpan={5}>No purchases found</Td></Tr>
                  ) : data?.data?.map(p => (
                    <Tr key={p.id}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{categoryIcons[p.equipmentType?.category] || '📦'}</span>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '13px' }}>{p.equipmentType?.name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.equipmentType?.category}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>{p.base?.name}</Td>
                      <Td>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e3a5f' }}>
                          {p.quantity.toLocaleString()}
                        </span>
                      </Td>
                      <Td style={{ color: '#6b7280' }}>{formatDate(p.purchaseDate)}</Td>
                      <Td style={{ fontSize: '12px', color: '#6b7280' }}>{p.creator?.username?.split('@')[0]}</Td>
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
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setFormErrors({}); }} title="Record New Purchase">
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
          <FormField label="Quantity" required error={formErrors.quantity}>
            <Input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="Enter quantity" error={formErrors.quantity} />
          </FormField>
          <FormField label="Purchase Date" required error={formErrors.purchaseDate}>
            <Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} error={formErrors.purchaseDate} />
          </FormField>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" onClick={() => setShowForm(false)} type="button">Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Record Purchase</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
