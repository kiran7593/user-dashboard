import { useState } from 'react'

type DashboardProps = {
  username: string
  email: string
  onLogout: () => void
  onProfileUpdate: (user: {
    username: string
    email: string
  }) => void
}

function Dashboard({
  username,
  email,
  onLogout,
  onProfileUpdate,
}: DashboardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState(username)
  const [newEmail, setNewEmail] = useState(email)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const initials = username
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleUpdateProfile(event: React.FormEvent) {
    event.preventDefault()

    setError('')
    setIsSaving(true)

    const token = localStorage.getItem('token')

    if (!token) {
      setError('You are not authenticated.')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('https://kiran-user-dashboard-api.onrender.com/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to update profile.')
        setIsSaving(false)
        return
      }

      onProfileUpdate({
        username: data.username,
        email: data.email,
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Update profile error:', error)
      setError('Unable to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit() {
    setNewUsername(username)
    setNewEmail(email)
    setError('')
    setIsEditing(true)
  }

  function handleCancel() {
    setNewUsername(username)
    setNewEmail(email)
    setError('')
    setIsEditing(false)
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>User Dashboard</h1>
          <p style={styles.headerSubtitle}>
            Manage your account and profile
          </p>
        </div>

        <button onClick={onLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </header>

      <main style={styles.main}>
        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <div style={styles.avatar}>
            {initials}
          </div>

          <div>
            <h2 style={styles.welcomeTitle}>
              Welcome back, {username}!
            </h2>

            <p style={styles.welcomeText}>
              Here's an overview of your account.
            </p>
          </div>
        </section>

        <div style={styles.grid}>
          {/* Profile Card */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Profile</h3>
                <p style={styles.cardSubtitle}>
                  Your personal information
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  style={styles.secondaryButton}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Username
                  </label>

                  <input
                    type="text"
                    value={newUsername}
                    onChange={(event) =>
                      setNewUsername(event.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Email
                  </label>

                  <input
                    type="email"
                    value={newEmail}
                    onChange={(event) =>
                      setNewEmail(event.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </div>

                {error && (
                  <p style={styles.error}>
                    {error}
                  </p>
                )}

                <div style={styles.buttonRow}>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    style={styles.cancelButton}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    Username
                  </span>

                  <span style={styles.infoValue}>
                    {username}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>
                    Email
                  </span>

                  <span style={styles.infoValue}>
                    {email}
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Account Information */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>
                  Account Information
                </h3>

                <p style={styles.cardSubtitle}>
                  Details about your account
                </p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Account Status
              </span>

              <span style={styles.statusBadge}>
                Active
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Authentication
              </span>

              <span style={styles.infoValue}>
                JWT
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>
                Member Since
              </span>

              <span style={styles.infoValue}>
                August 2026
              </span>
            </div>
          </section>

          {/* Security Card */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>
                  Security
                </h3>

                <p style={styles.cardSubtitle}>
                  Your account security
                </p>
              </div>
            </div>

            <div style={styles.securityMessage}>
              <div style={styles.securityIcon}>
                ✓
              </div>

              <div>
                <strong style={styles.securityTitle}>
                  Account Protected
                </strong>

                <p style={styles.securityText}>
                  Your account is authenticated using
                  JSON Web Tokens (JWT).
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

const styles: {
  [key: string]: React.CSSProperties
} = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    color: '#1f2937',
    fontFamily:
      'Arial, Helvetica, sans-serif',
  },

  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },

  headerTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#111827',
 },

  headerSubtitle: {
    margin: '5px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  logoutButton: {
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
  },

  welcomeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    marginBottom: '30px',
  },

  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    flexShrink: 0,
  },

  welcomeTitle: {
    margin: 0,
    fontSize: '28px',
    color: '#111827',
},

  welcomeText: {
    margin: '6px 0 0',
    color: '#6b7280',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '24px',
    boxShadow:
      '0 2px 6px rgba(0, 0, 0, 0.05)',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '20px',
  },

  cardTitle: {
    margin: 0,
    fontSize: '18px',
  },

  cardSubtitle: {
    margin: '5px 0 0',
    color: '#6b7280',
    fontSize: '13px',
  },

  secondaryButton: {
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  primaryButton: {
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  cancelButton: {
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },

  formGroup: {
    marginBottom: '16px',
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
  },

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '14px 0',
    borderBottom: '1px solid #f0f0f0',
  },

  infoLabel: {
    color: '#6b7280',
    fontSize: '14px',
  },

  infoValue: {
    fontWeight: '500',
    textAlign: 'right',
    wordBreak: 'break-word',
  },

  statusBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 'bold',
  },

  securityMessage: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#f0fdf4',
    padding: '15px',
    borderRadius: '8px',
  },

  securityIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  },

  securityTitle: {
    display: 'block',
    marginBottom: '4px',
  },

  securityText: {
    margin: 0,
    color: '#4b5563',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  error: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
  },
}

export default Dashboard
