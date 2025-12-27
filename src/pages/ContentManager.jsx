import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, AlertCircle, Rocket, Check, Loader } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const ContentManager = ({ onNavigate }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'essay',
    date: new Date().toISOString().split('T')[0],
  });

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/articles`);
      if (!response.ok) throw new Error('Failed to load articles');
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingId
        ? `${API_URL}/articles/${editingId}`
        : `${API_URL}/articles`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save article');
      }

      // Reload articles from server
      await loadArticles();

      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'essay',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
      console.error('Error saving article:', err);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      category: article.category,
      date: article.date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, category) => {
    if (!confirm('Delete this article?')) return;

    try {
      setError(null);
      const response = await fetch(`${API_URL}/articles/${id}?category=${category}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete article');

      // Reload articles
      await loadArticles();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting article:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'essay',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployStatus(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Deployment failed');
      }

      setDeployStatus(data);
      setShowDeployModal(true);
    } catch (err) {
      setError(err.message);
      console.error('Error deploying:', err);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Content Manager</h1>
          <p style={styles.subtitle}>Create and manage articles. Files are saved directly to your project.</p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            style={{
              ...styles.deployButton,
              opacity: deploying ? 0.6 : 1,
              cursor: deploying ? 'not-allowed' : 'pointer'
            }}
          >
            {deploying ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Deploying...
              </>
            ) : (
              <>
                <Rocket size={18} />
                Deploy
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('workbench')}
            style={styles.backButton}
          >
            ← Back to Workbench
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Form Section */}
        {showForm && (
          <div style={styles.formSection}>
            <div style={styles.formHeader}>
              <h2>{editingId ? 'Edit Article' : 'Add New Article'}</h2>
              <button
                onClick={handleCancel}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Article title"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="essay">Essay</option>
                  <option value="article">Article</option>
                  <option value="note">Note</option>
                  <option value="experiment">Experiment</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary (optional)"
                  style={{ ...styles.textarea, minHeight: '80px' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Full article content"
                  style={{ ...styles.textarea, minHeight: '300px' }}
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  {editingId ? 'Update' : 'Create'} Article
                </button>
                <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles List */}
        <div style={styles.listSection}>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={styles.addButton}
            >
              <Plus size={20} /> Add New Article
            </button>
          )}

          {error && !showForm && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={styles.empty}>
              <p>Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div style={styles.empty}>
              <p>No articles yet. Create one to get started.</p>
            </div>
          ) : (
            <div style={styles.articlesList}>
              {articles.map(article => (
                <div key={article.id} style={styles.articleCard}>
                  <div style={styles.articleHeader}>
                    <div>
                      <h3 style={styles.articleTitle}>{article.title}</h3>
                      <div style={styles.articleMeta}>
                        <span style={styles.category}>{article.category}</span>
                        <span style={styles.date}>
                          {new Date(article.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.articleActions}>
                      <button
                        onClick={() => handleEdit(article)}
                        style={styles.iconButton}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.category)}
                        style={{ ...styles.iconButton, color: '#d32f2f' }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {article.excerpt && (
                    <p style={styles.articleExcerpt}>{article.excerpt}</p>
                  )}
                  <p style={styles.preview}>
                    {article.content.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>{deployStatus?.success ? 'Deployment Successful' : 'Deployment Failed'}</h2>
              <button
                onClick={() => setShowDeployModal(false)}
                style={styles.modalClose}
              >
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalContent}>
              {deployStatus?.success ? (
                <>
                  <div style={styles.successIcon}>
                    <Check size={48} />
                  </div>
                  <p style={styles.successMessage}>{deployStatus?.message}</p>
                  <p style={styles.deployedAt}>
                    Deployed at: {new Date(deployStatus?.deployedAt).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <div style={styles.errorIcon}>
                    <AlertCircle size={48} />
                  </div>
                  <p style={styles.errorMessage}>{error || deployStatus?.message}</p>
                </>
              )}

              {deployStatus?.steps && (
                <div style={styles.stepsList}>
                  <h3 style={styles.stepsTitle}>Deployment Steps:</h3>
                  <ul style={styles.steps}>
                    {deployStatus.steps.map((step, idx) => (
                      <li key={idx} style={styles.step}>
                        <Check size={16} style={{ color: '#4caf50' }} /> {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowDeployModal(false)}
                style={styles.modalButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '32px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  deployButton: {
    padding: '10px 16px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '0.95rem',
    color: '#666',
  },
  backButton: {
    padding: '10px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  content: {
    flex: 1,
    padding: '32px 48px',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 'fit-content',
    maxWidth: '500px',
    width: '100%',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  submitButton: {
    padding: '10px 16px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  addButton: {
    padding: '12px 20px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s',
  },
  articlesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '16px',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
  },
  articleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  articleTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  articleMeta: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    fontSize: '0.8rem',
  },
  category: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    padding: '2px 8px',
    borderRadius: '3px',
    color: '#666',
    textTransform: 'capitalize',
  },
  date: {
    color: '#999',
  },
  articleActions: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  articleExcerpt: {
    margin: '0 0 8px 0',
    fontSize: '0.95rem',
    color: '#555',
    lineHeight: '1.4',
  },
  preview: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#999',
    lineHeight: '1.4',
  },
  empty: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '48px 32px',
    textAlign: 'center',
    color: '#999',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '4px',
    padding: '12px 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    color: '#c62828',
    fontSize: '0.9rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
  },
  modalContent: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
    textAlign: 'center',
  },
  successIcon: {
    color: '#4caf50',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  errorIcon: {
    color: '#d32f2f',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  successMessage: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#333',
    margin: '0 0 8px 0',
  },
  errorMessage: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#d32f2f',
    margin: '0 0 8px 0',
  },
  deployedAt: {
    fontSize: '0.85rem',
    color: '#999',
    margin: 0,
  },
  stepsList: {
    marginTop: '24px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    padding: '16px',
  },
  stepsTitle: {
    margin: '0 0 12px 0',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#333',
  },
  steps: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '8px',
    padding: '4px 0',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};

// Add animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default ContentManager;
