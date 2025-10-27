import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import { PermissionsProvider } from '../hooks/usePermissions';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

// Auth pages
import Login from '../pages/auth/Login';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Admin pages
import Users from '../pages/admin/Users';
import Units from '../pages/admin/Units';
import Roles from '../pages/admin/Roles';

// Finance pages
import Charges from '../pages/finance/Charges';
import Payments from '../pages/finance/Payments';
import Concepts from '../pages/finance/Concepts';
import Periods from '../pages/finance/Periods';
import GenerateCharges from '../pages/finance/GenerateCharges';
import RegisterPayment from '../pages/finance/RegisterPayment';
import FinanceDashboard from '../pages/finance/FinanceDashboard';

// Amenities pages
import Amenities from '../pages/amenities/Amenities';
import Reservations from '../pages/amenities/Reservations';
import Schedules from '../pages/amenities/Schedules';
import Rates from '../pages/amenities/Rates';
import AmenitiesDashboard from '../pages/amenities/AmenitiesDashboard';

// Maintenance pages
import Maintenance from '../pages/maintenance/Maintenance';
import Assets from '../pages/maintenance/Assets';
import PreventivePlans from '../pages/maintenance/PreventivePlans';
import Suppliers from '../pages/maintenance/Suppliers';
import MaintenanceDashboard from '../pages/maintenance/MaintenanceDashboard';

// Security pages
import Security from '../pages/security/Security';
import Visitors from '../pages/security/Visitors';
import AccessAuthorizations from '../pages/security/AccessAuthorizations';
import Events from '../pages/security/Events';
import Incidents from '../pages/security/Incidents';
import Attendance from '../pages/security/Attendance';
import SecurityDashboard from '../pages/security/SecurityDashboard';

// Notices pages
import Notices from '../pages/notices/Notices';

// Reports pages
import Reports from '../pages/reports/Reports';
import ReportsDashboard from '../pages/reports/ReportsDashboard';
import AdvancedReports from '../pages/reports/AdvancedReports';
import QuickReports from '../pages/reports/QuickReports';
import AdvancedAnalytics from '../pages/reports/AdvancedAnalytics';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionsProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/units" element={
            <ProtectedRoute>
              <Layout>
                <Units />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/roles" element={
            <ProtectedRoute>
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          } />
          
                  {/* Finance routes */}
                  <Route path="/finance" element={
                    <ProtectedRoute>
                      <Layout>
                        <FinanceDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/charges" element={
                    <ProtectedRoute>
                      <Layout>
                        <Charges />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/payments" element={
                    <ProtectedRoute>
                      <Layout>
                        <Payments />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/concepts" element={
                    <ProtectedRoute>
                      <Layout>
                        <Concepts />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/periods" element={
                    <ProtectedRoute>
                      <Layout>
                        <Periods />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/generate-charges" element={
                    <ProtectedRoute>
                      <Layout>
                        <GenerateCharges />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/finance/register-payment" element={
                    <ProtectedRoute>
                      <Layout>
                        <RegisterPayment />
                      </Layout>
                    </ProtectedRoute>
                  } />
          
          {/* Other module routes */}
          <Route path="/notices" element={
            <ProtectedRoute>
              <Layout>
                <Notices />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/security" element={
            <ProtectedRoute>
              <Layout>
                <SecurityDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security/visitors" element={
            <ProtectedRoute>
              <Layout>
                <Visitors />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security/authorizations" element={
            <ProtectedRoute>
              <Layout>
                <AccessAuthorizations />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security/events" element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security/incidents" element={
            <ProtectedRoute>
              <Layout>
                <Incidents />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/security/attendance" element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/amenities" element={
            <ProtectedRoute>
              <Layout>
                <AmenitiesDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/amenities/manage" element={
            <ProtectedRoute>
              <Layout>
                <Amenities />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/amenities/reservations" element={
            <ProtectedRoute>
              <Layout>
                <Reservations />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/amenities/schedules" element={
            <ProtectedRoute>
              <Layout>
                <Schedules />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/amenities/rates" element={
            <ProtectedRoute>
              <Layout>
                <Rates />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <Layout>
                <MaintenanceDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/maintenance/work-orders" element={
            <ProtectedRoute>
              <Layout>
                <Maintenance />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/maintenance/assets" element={
            <ProtectedRoute>
              <Layout>
                <Assets />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/maintenance/preventive-plans" element={
            <ProtectedRoute>
              <Layout>
                <PreventivePlans />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/maintenance/suppliers" element={
            <ProtectedRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <ReportsDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <ReportsDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports/advanced" element={
            <ProtectedRoute>
              <Layout>
                <AdvancedAnalytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports/quick" element={
            <ProtectedRoute>
              <Layout>
                <QuickReports />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports/filters" element={
            <ProtectedRoute>
              <Layout>
                <AdvancedReports />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports/manage" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PermissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;