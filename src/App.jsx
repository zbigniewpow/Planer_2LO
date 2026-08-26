import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PublicView from './pages/PublicView'
import AdminView from './pages/AdminView'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/public" element={<PublicView />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminView />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
