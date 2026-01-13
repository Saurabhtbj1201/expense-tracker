import { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import '../styles/Subscriptions.css';

interface SubscriptionFormData {
  name: string;
  amount: string;
  category: string;
  frequency: string;
  nextPaymentDate: string;
  description: string;
  isActive: boolean;
  isPaid: boolean;
}

const Subscriptions = () => {
  const { subscriptions, categories, fetchSubscriptions, fetchCategories, addSubscription, updateSubscription, deleteSubscription, addCategory } = useExpense();
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    description: '',
    isActive: true,
    isPaid: false,
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  useEffect(() => {
    fetchSubscriptions();
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      nextPaymentDate: new Date().toISOString().split('T')[0],
      description: '',
      isActive: true,
      isPaid: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (subscription: any) => {
    setIsEditMode(true);
    setEditingId(subscription._id);
    setFormData({
      name: subscription.name,
      amount: subscription.amount.toString(),
      category: subscription.category._id,
      frequency: subscription.frequency,
      nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString().split('T')[0],
      description: subscription.description || '',
      isActive: subscription.isActive,
      isPaid: subscription.isPaid || false,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const subscriptionData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        nextPaymentDate: formData.nextPaymentDate,
        description: formData.description,
        isActive: formData.isActive,
        isPaid: formData.isPaid,
        lastPaidDate: formData.isPaid ? new Date().toISOString() : undefined,
      };

      if (isEditMode && editingId) {
        await updateSubscription(editingId, subscriptionData);
      } else {
        await addSubscription(subscriptionData);
      }
      
      handleCloseModal();
      fetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteSubscription(deleteId);
        fetchSubscriptions();
        setShowDeleteModal(false);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const handleToggleActive = async (subscription: any) => {
    try {
      await updateSubscription(subscription._id, {
        ...subscription,
        category: subscription.category._id,
        isActive: !subscription.isActive,
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error toggling subscription status:', error);
    }
  };

  const handleMarkAsPaid = async (subscription: any) => {
    try {
      await updateSubscription(subscription._id, {
        ...subscription,
        category: subscription.category._id,
        isPaid: !subscription.isPaid,
        lastPaidDate: !subscription.isPaid ? new Date().toISOString() : subscription.lastPaidDate,
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error marking subscription as paid:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await addCategory({
        name: newCategoryName,
        icon: newCategoryIcon || '📁',
        color: newCategoryColor,
      });
      await fetchCategories();
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryIcon('');
      setNewCategoryColor('#3b82f6');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const getNextPaymentStatus = (date: string) => {
    const today = new Date();
    const nextDate = new Date(date);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', label: 'Overdue', color: '#dc2626' };
    if (diffDays === 0) return { status: 'today', label: 'Due Today', color: '#ea580c' };
    if (diffDays <= 7) return { status: 'soon', label: `${diffDays} days`, color: '#f59e0b' };
    return { status: 'upcoming', label: `${diffDays} days`, color: '#10b981' };
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.amount.toString().includes(searchTerm) ||
      subscription.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || subscription.category?._id === categoryFilter;
    const matchesFrequency = !frequencyFilter || subscription.frequency === frequencyFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && subscription.isActive) ||
      (statusFilter === 'inactive' && !subscription.isActive);
    
    return matchesSearch && matchesCategory && matchesFrequency && matchesStatus;
  });

  const totalActive = subscriptions.filter(s => s.isActive).length;
  const totalAmount = subscriptions.filter(s => s.isActive).reduce((sum, sub) => {
    // Calculate monthly equivalent
    const multiplier = {
      daily: 30,
      weekly: 4,
      monthly: 1,
      yearly: 1/12
    }[sub.frequency] || 1;
    return sum + (sub.amount * multiplier);
  }, 0);

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-container">
        {/* Left Sidebar */}
        <div className="subscriptions-left-sidebar">
          <div className="subscriptions-header">
            <div className="header-content">
              <h1>Subscriptions</h1>
              <p className="subtitle">Manage recurring payments</p>
            </div>
            <button className="btn-primary" onClick={handleOpenAddModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Subscription
            </button>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>

              <select value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)}>
                <option value="">All Frequencies</option>
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {(searchTerm || categoryFilter || frequencyFilter || statusFilter) && (
                <button 
                  className="btn-clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setFrequencyFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Active</div>
              <div className="summary-value">{totalActive}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total</div>
              <div className="summary-value">{subscriptions.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Monthly Cost</div>
              <div className="summary-value">₹{totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Right Content - Subscriptions Table */}
        <div className="subscriptions-right-content">
          <div className="subscriptions-table-container">
            {filteredSubscriptions.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>No subscriptions found</h3>
                <p>Start tracking your recurring payments</p>
                <button className="btn-primary" onClick={handleOpenAddModal}>Add Your First Subscription</button>
              </div>
            ) : (
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Amount</th>
                    <th>Next Payment</th>
                    <th>Paid</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => {
                    const paymentStatus = getNextPaymentStatus(subscription.nextPaymentDate);
                    return (
                      <tr key={subscription._id}>
                        <td>
                          <button
                            className={`status-toggle ${subscription.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(subscription)}
                            title={subscription.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                          >
                            {subscription.isActive ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="subscription-name">{subscription.name}</td>
                        <td>
                          <span className="category-badge" style={{ backgroundColor: subscription.category?.color + '20', color: subscription.category?.color }}>
                            {subscription.category?.name}
                          </span>
                        </td>
                        <td className="frequency-badge">
                          <span className="badge-pill">{frequencies.find(f => f.value === subscription.frequency)?.label}</span>
                        </td>
                        <td className="subscription-amount">₹{subscription.amount.toFixed(2)}</td>
                        <td>
                          <div className="payment-status">
                            <span className="payment-date">{new Date(subscription.nextPaymentDate).toLocaleDateString()}</span>
                            {subscription.isActive && (
                              <span className="payment-badge" style={{ color: paymentStatus.color, backgroundColor: paymentStatus.color + '20' }}>
                                {paymentStatus.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className={`paid-toggle ${subscription.isPaid ? 'paid' : 'unpaid'}`}
                            onClick={() => handleMarkAsPaid(subscription)}
                            title={subscription.isPaid ? 'Paid - Click to mark unpaid' : 'Unpaid - Click to mark paid'}
                          >
                            {subscription.isPaid ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Paid
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Unpaid
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon btn-edit" onClick={() => handleOpenEditModal(subscription)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button className="btn-icon btn-delete" onClick={() => handleDelete(subscription._id)} title="Delete">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Subscription' : 'Add New Subscription'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="subscription-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Subscription Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Netflix Premium"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <div className="category-input-group">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-add-category"
                      onClick={() => setShowCategoryModal(true)}
                      title="Add new category"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequency *</label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nextPaymentDate">Next Payment Date *</label>
                <input
                  type="date"
                  id="nextPaymentDate"
                  name="nextPaymentDate"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active subscription</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleChange}
                  />
                  <span>Mark as paid</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditMode ? 'Update Subscription' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button className="btn-close" onClick={() => setShowCategoryModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="category-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name *</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Streaming Services"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryIcon">Icon (Emoji)</label>
                  <input
                    type="text"
                    id="categoryIcon"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="📺"
                    maxLength={2}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoryColor">Color</label>
                  <input
                    type="color"
                    id="categoryColor"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleAddCategory}>
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="delete-confirmation">
              <div className="warning-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>Are you sure you want to delete this subscription? This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
