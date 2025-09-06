import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/SupabaseService';
import './MediaManager.css';

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
}

const MediaManager: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getMediaFiles();
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await SupabaseService.deleteMediaFile(fileId);
      setMediaFiles(mediaFiles.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleUpdateFile = async (fileId: string, updates: Partial<MediaFile>) => {
    try {
      await SupabaseService.updateMediaFile(fileId, updates);
      setMediaFiles(mediaFiles.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      ));
      if (selectedFile?.id === fileId) {
        setSelectedFile({ ...selectedFile, ...updates });
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Error updating file');
    }
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      default: return '📎';
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.alt_text || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || getFileType(file.mime_type) === filterType;
    
    return matchesSearch && matchesType;
  });

  const fileTypes = ['all', 'image', 'video', 'audio', 'pdf', 'document'];

  if (loading) {
    return (
      <div className="media-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading media files...</p>
      </div>
    );
  }

  return (
    <div className="media-manager">
      <div className="manager-header">
        <div className="header-left">
          <h1>Media Library</h1>
          <p>Manage your uploaded files and media assets</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
          <button className="upload-btn">
            <span className="btn-icon">⬆️</span>
            Upload Files
          </button>
        </div>
      </div>

      <div className="manager-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Files
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="media-stats">
        <div className="stat-item">
          <span className="stat-value">{mediaFiles.length}</span>
          <span className="stat-label">Total Files</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{mediaFiles.filter(f => getFileType(f.mime_type) === 'image').length}</span>
          <span className="stat-label">Images</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {formatFileSize(mediaFiles.reduce((total, f) => total + (f.file_size || 0), 0))}
          </span>
          <span className="stat-label">Total Size</span>
        </div>
      </div>

      <div className="media-layout">
        <div className="media-grid">
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No files found</h3>
              <p>Upload files to get started</p>
              <button className="upload-btn">
                Upload Files
              </button>
            </div>
          ) : (
            <div className={`file-${viewMode}`}>
              {filteredFiles.map((file) => {
                const fileType = getFileType(file.mime_type);
                return (
                  <div 
                    key={file.id} 
                    className={`file-item ${selectedFile?.id === file.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="file-preview">
                      {fileType === 'image' ? (
                        <img 
                          src={file.file_path} 
                          alt={file.alt_text || file.original_filename}
                          loading="lazy"
                        />
                      ) : (
                        <div className="file-icon">
                          {getFileIcon(fileType)}
                        </div>
                      )}
                    </div>
                    
                    <div className="file-info">
                      <h4 className="file-name" title={file.original_filename}>
                        {file.original_filename}
                      </h4>
                      <p className="file-meta">
                        {formatFileSize(file.file_size || 0)} • {fileType}
                      </p>
                      {file.width && file.height && (
                        <p className="file-dimensions">
                          {file.width} × {file.height}
                        </p>
                      )}
                    </div>

                    <div className="file-actions">
                      <button
                        className="action-btn copy"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(file.file_path);
                          alert('URL copied to clipboard');
                        }}
                        title="Copy URL"
                      >
                        📋
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-details">
            <div className="details-header">
              <h2>File Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </button>
            </div>

            <div className="details-content">
              <div className="file-preview-large">
                {getFileType(selectedFile.mime_type) === 'image' ? (
                  <img 
                    src={selectedFile.file_path} 
                    alt={selectedFile.alt_text || selectedFile.original_filename}
                  />
                ) : (
                  <div className="file-icon-large">
                    {getFileIcon(getFileType(selectedFile.mime_type))}
                  </div>
                )}
              </div>

              <div className="file-metadata">
                <div className="metadata-item">
                  <label>Filename:</label>
                  <span>{selectedFile.original_filename}</span>
                </div>
                
                <div className="metadata-item">
                  <label>File Size:</label>
                  <span>{formatFileSize(selectedFile.file_size || 0)}</span>
                </div>
                
                <div className="metadata-item">
                  <label>Type:</label>
                  <span>{selectedFile.mime_type}</span>
                </div>
                
                {selectedFile.width && selectedFile.height && (
                  <div className="metadata-item">
                    <label>Dimensions:</label>
                    <span>{selectedFile.width} × {selectedFile.height} px</span>
                  </div>
                )}
                
                <div className="metadata-item">
                  <label>Uploaded:</label>
                  <span>{new Date(selectedFile.created_at).toLocaleString()}</span>
                </div>
                
                <div className="metadata-item">
                  <label>URL:</label>
                  <div className="url-copy">
                    <input 
                      type="text" 
                      value={selectedFile.file_path} 
                      readOnly 
                      className="url-input"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFile.file_path);
                        alert('URL copied to clipboard');
                      }}
                      className="copy-url-btn"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="file-edit-form">
                <div className="form-group">
                  <label htmlFor="alt_text">Alt Text:</label>
                  <input
                    type="text"
                    id="alt_text"
                    value={selectedFile.alt_text || ''}
                    onChange={(e) => setSelectedFile({ ...selectedFile, alt_text: e.target.value })}
                    onBlur={(e) => handleUpdateFile(selectedFile.id, { alt_text: e.target.value })}
                    placeholder="Descriptive text for accessibility"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    value={selectedFile.description || ''}
                    onChange={(e) => setSelectedFile({ ...selectedFile, description: e.target.value })}
                    onBlur={(e) => handleUpdateFile(selectedFile.id, { description: e.target.value })}
                    placeholder="Optional description or notes"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;