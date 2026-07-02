import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { DealsPage } from './pages/DealsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage, SignupPage, ReferralPage, ForgotPasswordPage } from './pages/AuthPages';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[104px] lg:pt-[140px]">{children}</main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthLayout>
                <SignupPage />
              </AuthLayout>
            }
          />
          <Route
            path="/referral"
            element={
              <AppLayout>
                <ReferralPage />
              </AppLayout>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AuthLayout>
                <AdminPage />
              </AuthLayout>
            }
          />
          <Route
            path="/"
            element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            }
          />
          <Route
            path="/stores"
            element={
              <AppLayout>
                <StoresPage />
              </AppLayout>
            }
          />
          <Route
            path="/store/:slug"
            element={
              <AppLayout>
                <StoreDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/deals"
            element={
              <AppLayout>
                <DealsPage />
              </AppLayout>
            }
          />
          <Route
            path="/categories"
            element={
              <AppLayout>
                <StoresPage />
              </AppLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
