import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function WECategories() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Forms
  const [form, setForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/categories', d),
    onSuccess: () => { qc.invalidateQueries(['categories']); setShowForm(false); setForm({ name: '', description: '' }); },
    onError: (err) => setError(err.message),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/categories/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['categories']); setEditing(null); },
  });
  
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries(['categories']); },
  });

  const categories = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Product Categories"
        subtitle="Manage product classification"
        actions={
          <button onClick={() => { setShowForm(true); setForm({ name: '', description: '' }); }} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">New Category</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted hover:text-text-primary" /></button>
          </div>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); setError(''); create.mutate(form); }} className="space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Category name *"
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description"
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50">
              {create.isPending ? 'Creating…' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-surface-100 animate-pulse rounded" />)}</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">No categories yet</div>
        ) : (
          <div className="divide-y divide-surface-200">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-6 py-4">
                {editing === cat.id ? (
                  <div className="flex-1 mr-6 space-y-2">
                    <input 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      autoFocus 
                      placeholder="Category name"
                      className="w-full px-3 py-1.5 text-sm font-medium border border-brand-500 rounded focus:outline-none" 
                    />
                    <input 
                      value={editForm.description} 
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-1.5 text-xs text-text-muted border border-surface-300 rounded focus:outline-none focus:border-brand-500" 
                    />
                  </div>
                ) : (
                  <div className="flex-1 mr-6">
                    <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                    {cat.description && <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>}
                  </div>
                )}
                
                <div className="flex items-center gap-3 shrink-0">
                  {editing === cat.id ? (
                    <>
                      <button 
                        onClick={() => { update.mutate({ id: cat.id, data: editForm }); }} 
                        className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditing(null)} 
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-text-muted mr-2">{cat.product_count || 0} products</span>
                      <button 
                        onClick={() => { setEditing(cat.id); setEditForm({ name: cat.name, description: cat.description || '' }); }} 
                        className="p-1.5 hover:bg-surface-100 rounded text-text-muted hover:text-brand-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Are you sure you want to delete this category?')) remove.mutate(cat.id); }} 
                        className="p-1.5 hover:bg-red-50 rounded text-text-muted hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
