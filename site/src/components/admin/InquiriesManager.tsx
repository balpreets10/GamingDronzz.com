import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/SupabaseService';
import './InquiriesManager.css';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  service_interest?: string;
  project_budget?: string;
  timeline?: string;
  status: string;
  priority: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

const InquiriesManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getInquiries();
      setInquiries(data || []);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await SupabaseService.updateInquiry(inquiryId, { status: newStatus });
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Error updating inquiry status');
    }
  };

  const handlePriorityChange = async (inquiryId: string, newPriority: number) => {
    try {
      await SupabaseService.updateInquiry(inquiryId, { priority: newPriority });
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, priority: newPriority } : inquiry
      ));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, priority: newPriority });
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Error updating inquiry priority');
    }
  };

  const handleNotesUpdate = async (inquiryId: string, notes: string) => {
    try {
      await SupabaseService.updateInquiry(inquiryId, { notes });
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, notes } : inquiry
      ));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, notes });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Error updating notes');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await SupabaseService.deleteInquiry(inquiryId);
      setInquiries(inquiries.filter(i => i.id !== inquiryId));
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Error deleting inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || inquiry.priority.toString() === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'in-progress': return 'yellow';
      case 'responded': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <div className="inquiries-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="inquiries-manager">
      <div className="manager-header">
        <div className="header-left">
          <h1>Inquiries Management</h1>
          <p>Manage customer inquiries and leads</p>
        </div>
        <div className="header-stats">
          <span className="stat">
            <strong>{inquiries.filter(i => i.status === 'new').length}</strong> New
          </span>
          <span className="stat">
            <strong>{inquiries.filter(i => i.status === 'in-progress').length}</strong> In Progress
          </span>
        </div>
      </div>

      <div className="manager-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="3">High Priority</option>
            <option value="2">Medium Priority</option>
            <option value="1">Low Priority</option>
            <option value="0">Normal</option>
          </select>
        </div>
      </div>

      <div className="inquiries-layout">
        <div className="inquiries-list">
          {filteredInquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📬</div>
              <h3>No inquiries found</h3>
              <p>Customer inquiries will appear here</p>
            </div>
          ) : (
            <div className="inquiry-cards">
              {filteredInquiries.map((inquiry) => (
                <div 
                  key={inquiry.id} 
                  className={`inquiry-card ${selectedInquiry?.id === inquiry.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <div className="inquiry-header">
                    <div className="inquiry-info">
                      <h4 className="inquiry-name">{inquiry.name}</h4>
                      <p className="inquiry-email">{inquiry.email}</p>
                    </div>
                    <div className="inquiry-badges">
                      <span className={`status-badge ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.replace('-', ' ')}
                      </span>
                      {inquiry.priority > 0 && (
                        <span className="priority-badge">
                          {getPriorityLabel(inquiry.priority)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="inquiry-content">
                    <h5 className="inquiry-subject">{inquiry.subject}</h5>
                    <p className="inquiry-preview">
                      {inquiry.message.substring(0, 120)}...
                    </p>
                  </div>
                  
                  <div className="inquiry-meta">
                    <span className="inquiry-date">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </span>
                    {inquiry.company && (
                      <span className="inquiry-company">{inquiry.company}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedInquiry && (
          <div className="inquiry-details">
            <div className="details-header">
              <h2>Inquiry Details</h2>
              <div className="details-actions">
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={selectedInquiry.priority}
                  onChange={(e) => handlePriorityChange(selectedInquiry.id, parseInt(e.target.value))}
                  className="priority-select"
                >
                  <option value="0">Normal Priority</option>
                  <option value="1">Low Priority</option>
                  <option value="2">Medium Priority</option>
                  <option value="3">High Priority</option>
                </select>
                
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                  title="Delete inquiry"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedInquiry.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedInquiry.email}</span>
                  </div>
                  {selectedInquiry.company && (
                    <div className="detail-item">
                      <label>Company:</label>
                      <span>{selectedInquiry.company}</span>
                    </div>
                  )}
                  {selectedInquiry.phone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedInquiry.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Project Details</h3>
                <div className="detail-item">
                  <label>Subject:</label>
                  <span>{selectedInquiry.subject}</span>
                </div>
                {selectedInquiry.project_budget && (
                  <div className="detail-item">
                    <label>Budget:</label>
                    <span>{selectedInquiry.project_budget}</span>
                  </div>
                )}
                {selectedInquiry.timeline && (
                  <div className="detail-item">
                    <label>Timeline:</label>
                    <span>{selectedInquiry.timeline}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Message</h3>
                <div className="message-content">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="detail-section">
                <h3>Internal Notes</h3>
                <textarea
                  value={selectedInquiry.notes || ''}
                  onChange={(e) => {
                    setSelectedInquiry({ ...selectedInquiry, notes: e.target.value });
                  }}
                  onBlur={(e) => handleNotesUpdate(selectedInquiry.id, e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  className="notes-textarea"
                  rows={4}
                />
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Received:</label>
                    <span>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{new Date(selectedInquiry.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiriesManager;