import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, basesApi } from '../api/endpoints';
import { Card, CardHeader, CardTitle, CardBody } from '../components/UI/Card';
import { Table, Thead, Th, Tbody, Tr, Td } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import FormField, { Input, Select } from '../components/UI/FormField';
import { StatusBadge } from '../components/UI/Badge';
import Spinner from '../components/UI/Spinner';
import { useToast } from '../components/UI/Toast';
import { useAuth } from '../context/AuthContext';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ROLES = ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'];

const emptyForm = { username: '', password: '', role: '', baseId: '' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const { data: bases = [] } = useQuery({
    queryKey: ['bases'],
    queryFn: () => basesApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => usersApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('User created successfully', 'success');
      closeForm();
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to create user', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('User updated successfully', 'success');
      closeForm();
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to update user', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast('User deleted', 'warning');
      setDeleteTarget(null);
    },
    onError: (err) => toast(err.response?.data?.message || 'Failed to delete user', 'error'),
  });

  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', role: u.role, baseId: u.baseId || '' });
    setShowForm(true);
  };

  const validate = () => {
    const errors = {};
    if (!editUser && !form.username.trim()) errors.username = 'Username is required';
    if (!editUser && !form.password) errors.password = 'Password is required';
    if (!editUser && form.password && form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!form.role) errors.role = 'Role is required';
    if (form.role !== 'ADMIN' && !form.baseId) errors.baseId = 'Base is required for non-admin roles';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      username: form.username,
      role: form.role,
      baseId: form.role === 'ADMIN' ? null : form.baseId,
      ...(form.password && { password: form.password }),
    };
    if (editUser) {
      updateMutation.mutate({ id: editUser.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const roleIcon = { ADMIN: '🔴', BASE_COMMANDER: '🟡', LOGISTICS_OFFICER: '🟢' };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <Button icon="+" onClick={() => { setEditUser(null); setForm(emptyForm); setShowForm(true); }}>
            Add User
          </Button>
        </CardHeader>

        <CardBody style={{ padding: 0 }}>
          {isLoading ? <Spinner center /> : (
            <Table>
              <Thead>
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Base</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {users.length === 0 ? (
                  <Tr><Td style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }} colSpan={5}>No users found</Td></Tr>
                ) : users.map(u => (
                  <Tr key={u.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0,
                        }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '13px' }}>{u.username}</div>
                          {u.id === currentUser?.id && (
                            <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '10px' }}>You</span>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{roleIcon[u.role]}</span>
                        <StatusBadge status={u.role} />
                      </div>
                    </Td>
                    <Td style={{ fontSize: '13px', color: '#6b7280' }}>
                      {u.base ? `📍 ${u.base.name}` : <span style={{ color: '#d1d5db' }}>—</span>}
                    </Td>
                    <Td style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(u.createdAt)}</Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                        {u.id !== currentUser?.id && (
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(u)}>Delete</Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editUser ? `Edit User: ${editUser.username}` : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          {!editUser && (
            <FormField label="Username / Email" required error={formErrors.username}>
              <Input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. commander.delta@mams.mil"
                error={formErrors.username}
              />
            </FormField>
          )}
          <FormField
            label={editUser ? 'New Password (leave blank to keep current)' : 'Password'}
            required={!editUser}
            error={formErrors.password}
          >
            <Input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={editUser ? 'Leave blank to keep current password' : 'Min. 8 characters'}
              error={formErrors.password}
            />
          </FormField>
          <FormField label="Role" required error={formErrors.role}>
            <Select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value, baseId: e.target.value === 'ADMIN' ? '' : form.baseId })}
              error={formErrors.role}
            >
              <option value="">Select role...</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{roleIcon[r]} {r.replace('_', ' ')}</option>
              ))}
            </Select>
          </FormField>
          {form.role && form.role !== 'ADMIN' && (
            <FormField label="Assigned Base" required error={formErrors.baseId}>
              <Select
                value={form.baseId}
                onChange={e => setForm({ ...form, baseId: e.target.value })}
                error={formErrors.baseId}
              >
                <option value="">Select base...</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" type="button" onClick={closeForm}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete" size="sm">
        {deleteTarget && (
          <div>
            <p style={{ color: '#374151', marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              Are you sure you want to delete <strong>{deleteTarget.username}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
