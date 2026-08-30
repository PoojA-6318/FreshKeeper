import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Household from './pages/Household';
import Refrigerators from './pages/Refrigerators';
import Inventory from './pages/Inventory';
import AddFood from './pages/AddFood';
import EditFood from './pages/EditFood';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import ShoppingList from './pages/ShoppingList';

/** Layout wrapper: sidebar + main content */
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
            },
            success: {
              iconTheme: { primary: '#3D7A4F', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#DC2626', secondary: '#fff' },
            },
            duration: 3500,
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — wrapped in AppLayout with Sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/household" element={<Household />} />
            <Route path="/refrigerators" element={<Refrigerators />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<AddFood />} />
            <Route path="/inventory/edit/:id" element={<EditFood />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
