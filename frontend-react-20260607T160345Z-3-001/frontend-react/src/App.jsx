import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/patient/PatientDashboard'
import MedecinDashboard from './pages/medecin/MedecinDashboard'
import SecretaireDashboard from './pages/secretaire/SecretaireDashboard'

/** Route protégée : redirige vers /login si non connecté, et selon le rôle. */
function Protected({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />
  return children
}

export function dashboardPath(role) {
  switch (role) {
    case 'PATIENT': return '/patient'
    case 'MEDECIN': return '/medecin'
    case 'SECRETAIRE': return '/secretaire'
    default: return '/'
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/patient" element={<Protected role="PATIENT"><PatientDashboard /></Protected>} />
      <Route path="/medecin" element={<Protected role="MEDECIN"><MedecinDashboard /></Protected>} />
      <Route path="/secretaire" element={<Protected role="SECRETAIRE"><SecretaireDashboard /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
