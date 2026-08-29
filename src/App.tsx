import { useEffect, useState } from 'react'
import Dashboard from './Dashboard'

type User = {
  id: number
  username: string
  email: string
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return
    }

    fetch('http://localhost:5000/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Invalid token')
        }

        return response.json()
      })
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Authentication error:', error)
        localStorage.removeItem('token')
        setLoading(false)
      })
  }, [])

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      setUser(data.user)

      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Login error:', error)
      setError('Unable to connect to the server.')
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setIsRegistering(false)
      setUsername('')
      setEmail('')
      setPassword('')
      setError('')
    } catch (error) {
      console.error('Registration error:', error)
      setError('Unable to connect to the server.')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  function handleProfileUpdate(updatedUser: {
    username: string
    email: string
  }) {
    setUser((currentUser) => {
      if (!currentUser) {
        return null
      }

      return {
        ...currentUser,
        username: updatedUser.username,
        email: updatedUser.email,
      }
    })
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p>Loading your account...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <Dashboard
        username={user.username}
        email={user.email}
        onLogout={logout}
        onProfileUpdate={handleProfileUpdate}
      />
    )
  }

  return (
    <div style={styles.authPage}>
      <div style={styles.authCard}>
        <h1 style={styles.logo}>
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>

        <p style={styles.subtitle}>
          {isRegistering
            ? 'Create an account to get started.'
            : 'Log in to access your dashboard.'}
        </p>

        {isRegistering ? (
          <form onSubmit={handleRegister}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>

              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                style={styles.input}
                placeholder="Enter your username"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.input}
                placeholder="Create a password"
                required
              />
            </div>

            <button type="submit" style={styles.primaryButton}>
              Create Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" style={styles.primaryButton}>
              Log In
            </button>
          </form>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.switchSection}>
          {isRegistering ? (
            <>
              <span>Already have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false)
                  setError('')
                }}
                style={styles.linkButton}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              <span>Don't have an account?</span>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true)
                  setError('')
                }}
                style={styles.linkButton}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: {
  [key: string]: React.CSSProperties
} = {
  authPage: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },

  authCard: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    boxSizing: 'border-box',
  },

  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
  },

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '30px',
    lineHeight: 1.5,
  },

  formGroup: {
    marginBottom: '18px',
  },

  label: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '7px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    fontSize: '15px',
  },

  primaryButton: {
    width: '100%',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    marginTop: '5px',
  },

  error: {
    marginTop: '18px',
    padding: '11px',
    borderRadius: '7px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '14px',
  },

  switchSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '25px',
    color: '#6b7280',
    fontSize: '14px',
  },

  linkButton: {
    border: 'none',
    background: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: '0',
    fontSize: '14px',
  },

  loadingPage: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },

  loadingCard: {
    backgroundColor: '#ffffff',
    padding: '30px 40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  },
}

export default App
