import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PublicView from './pages/PublicView'
import AdminView from './pages/AdminView'
import PrintClasses from './pages/PrintClasses'
import PrintTeachers from './pages/PrintTeachers'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/public" element={<PublicView />} />
      <Route path="/drukuj/klasy" element={<PrintClasses />} />
      <Route path="/drukuj/nauczyciele" element={<PrintTeachers />} />
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
