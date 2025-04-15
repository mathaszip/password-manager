import { useState, useContext } from "react";
import { PasswordContext } from "../context/PasswordContext";
import { generateRandomPassword } from "../utils/encryption";
import LoadingSpinner from "../components/LoadingSpinner";

interface PasswordForm {
  title: string;
  website: string;
  username: string;
  password: string;
}

const Dashboard = () => {
  const {
    passwords,
    loading,
    addPassword,
    updatePassword,
    deletePassword,
    decryptPassword,
  } = useContext(PasswordContext);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<PasswordForm>({
    title: "",
    website: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPassword(formData);
      setFormData({ title: "", website: "", username: "", password: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding password:", error);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    try {
      await updatePassword(editingId, formData);
      setFormData({ title: "", website: "", username: "", password: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleEdit = (password: any) => {
    setEditingId(password.id);
    setFormData({
      title: password.title,
      website: password.website || "",
      username: password.username || "",
      password: "", // We don't set the decrypted password for security
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this password?")) {
      try {
        await deletePassword(id);
      } catch (error) {
        console.error("Error deleting password:", error);
      }
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword(16);
    setFormData({
      ...formData,
      password: newPassword,
    });
  };

  const toggleShowPassword = (id: number) => {
    setShowPassword({
      ...showPassword,
      [id]: !showPassword[id],
    });
  };

  const getDecryptedPassword = (password: any) => {
    // Check both possible property names for encrypted password
    const encryptedPassword =
      password.encryptedPassword || password.encrypted_password;
    const iv = password.iv;

    // Simple validation without debug logging
    if (!encryptedPassword) {
      return "Error: Missing password data";
    }

    if (!iv) {
      return "Error: Missing initialization vector";
    }

    const decrypted = decryptPassword(encryptedPassword, iv);

    // Return the decrypted password or an error message if it starts with 'Error:'
    return decrypted;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Your Passwords</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? "Cancel" : "Add New Password"}
        </button>
      </div>

      {showAddForm && (
        <div className="form-card">
          <h3>Add New Password</h3>
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username/Email</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group password-field">
              <label htmlFor="password">Password</label>
              <div className="password-input-group">
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="btn-secondary"
                >
                  Generate
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Save Password
            </button>
          </form>
        </div>
      )}

      {editingId !== null && (
        <div className="form-card">
          <h3>Edit Password</h3>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-website">Website</label>
              <input
                type="text"
                id="edit-website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-username">Username/Email</label>
              <input
                type="text"
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group password-field">
              <label htmlFor="edit-password">
                Password (leave empty to keep unchanged)
              </label>
              <div className="password-input-group">
                <input
                  type="text"
                  id="edit-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="btn-secondary"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="passwords-list">
        {passwords.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any saved passwords yet.</p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Password
              </button>
            )}
          </div>
        ) : (
          <>
            {passwords.map((password) => (
              <div key={password.id} className="password-card">
                <div className="password-card-header">
                  <h3>{password.title}</h3>
                  <div className="password-actions">
                    <button
                      onClick={() => handleEdit(password)}
                      className="btn-icon"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(password.id)}
                      className="btn-icon btn-danger"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="password-details">
                  {password.website && (
                    <div className="detail-item">
                      <span className="detail-label">Website:</span>
                      <span className="detail-value">{password.website}</span>
                    </div>
                  )}

                  {password.username && (
                    <div className="detail-item">
                      <span className="detail-label">Username:</span>
                      <span className="detail-value">{password.username}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">Password:</span>
                    <div className="password-value">
                      {showPassword[password.id] ? (
                        <span
                          className={
                            getDecryptedPassword(password)?.startsWith("Error:")
                              ? "error-text"
                              : ""
                          }
                        >
                          {getDecryptedPassword(password)}
                        </span>
                      ) : (
                        <span>••••••••</span>
                      )}
                      <button
                        onClick={() => toggleShowPassword(password.id)}
                        className="btn-text"
                      >
                        {showPassword[password.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
