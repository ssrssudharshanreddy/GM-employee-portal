import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import PageHeader from '../../components/PageHeader';
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';

export default function WECategories() {
  const qc = useQueryClient();
  
  // States
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  // Forms
  const [form, setForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  
  const [error, setError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/categories', d),
    onSuccess: () => { 
      qc.invalidateQueries(['categories']); 
      setShowForm(false); 
      setForm({ name: '', description: '' }); 
    },
    onError: (err) => setError(err.message),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/categories/${id}`, data),
    onSuccess: () => { 
      qc.invalidateQueries(['categories']); 
      setEditing(null); 
      setGlobalError('');
    },
    onError: (err) => setGlobalError(err.message),
  });
  
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries(['categories']); 
      setDeleting(null);
      setGlobalError('');
    },
    onError: (err) => {
      setDeleting(null);
      setGlobalError(err.message || 'Failed to delete category.');
    },
  });

  const categories = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Product Categories"
        subtitle="Manage product classification"
        actions={
          <button 
            onClick={() => { setShowForm(true); setForm({ name: '', description: '' }); setError(''); setGlobalError(''); }} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        }
      />

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Operation Failed</h3>
            <p className="text-sm text-red-700 mt-1">{globalError}</p>
          </div>
          <button onClick={() => setGlobalError('')} className="p-1 hover:bg-red-100 rounded text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6 max-w-lg border border-surface-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">New Category</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-surface-100 rounded-md transition-colors">
              <X className="w-5 h-5 text-text-muted hover:text-text-primary" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-100">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); setError(''); create.mutate(form); }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Category Name *</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                placeholder="e.g. Cleaning Supplies"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-50 focus:bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="Optional description"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface-50 focus:bg-white transition-colors resize-none" 
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 mr-2 text-sm font-medium text-text-secondary bg-surface-100 rounded-md hover:bg-surface-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={create.isPending} 
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {create.isPending ? 'Creating…' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-hidden border border-surface-200">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-surface-100 animate-pulse rounded-md" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">No categories found. Click 'Add Category' to create one.</div>
        ) : (
          <div className="divide-y divide-surface-200">
            {categories.map((cat) => (
              <div key={cat.id} className="group flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 hover:bg-surface-50 transition-colors gap-4 sm:gap-0">
                
                {editing === cat.id ? (
                  <div className="flex-1 sm:mr-8 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Name</label>
                          <input 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            autoFocus 
                            placeholder="Category name"
                            className="w-full px-3 py-1.5 text-sm font-medium border border-brand-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
                          <input 
                            value={editForm.description} 
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-1.5 text-sm text-text-secondary border border-surface-300 rounded-md focus:outline-none focus:border-brand-500 transition-colors" 
                          />
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 sm:pt-5">
                        <button 
                          onClick={() => update.mutate({ id: cat.id, data: editForm })} 
                          disabled={update.isPending}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button 
                          onClick={() => setEditing(null)} 
                          disabled={update.isPending}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-200 text-text-secondary text-xs font-medium rounded-md hover:bg-surface-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 sm:mr-6 pr-0 sm:pr-4 border-b sm:border-b-0 border-transparent group-hover:border-surface-200 pb-3 sm:pb-0 transition-colors">
                    <h3 className="text-sm font-semibold text-text-primary">{cat.name}</h3>
                    {cat.description && <p className="text-xs text-text-secondary mt-1 max-w-full sm:max-w-2xl truncate">{cat.description}</p>}
                  </div>
                )}
                
                {editing !== cat.id && (
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto">
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className="text-sm font-medium text-text-primary">{cat.product_count || 0}</span>
                      <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">Products</span>
                    </div>
                    
                    <div className="hidden sm:block h-8 w-px bg-surface-200 mx-2"></div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditing(cat.id); setEditForm({ name: cat.name, description: cat.description || '' }); setGlobalError(''); }} 
                        className="p-2 text-text-muted hover:bg-brand-50 hover:text-brand-600 rounded-md transition-all tooltip-trigger"
                        title="Edit Category"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleting(cat)} 
                        className="p-2 text-text-muted hover:bg-red-50 hover:text-red-600 rounded-md transition-all tooltip-trigger"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-center text-text-primary mb-2">Delete Category?</h3>
              <p className="text-sm text-center text-text-secondary mb-6">
                Are you sure you want to delete <span className="font-semibold text-text-primary">"{deleting.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleting(null)} 
                  disabled={remove.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => remove.mutate(deleting.id)} 
                  disabled={remove.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {remove.isPending ? 'Deleting...' : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
