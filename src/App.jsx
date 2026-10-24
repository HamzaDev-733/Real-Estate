import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import { Curtain, PageWrap } from './components/PageTransition.jsx';
import { useStore } from './store/StoreContext.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import Investment from './pages/Investment.jsx';
import Calculator from './pages/Calculator.jsx';
import Listings from './pages/Listings.jsx';
import Meeting from './pages/Meeting.jsx';

const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const AdminLogin = lazy(() => import('./admin/AdminLogin.jsx'));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const SettingsPage = lazy(() => import('./admin/SettingsPage.jsx'));
const lazySection = (name) => lazy(() => import('./admin/sections.jsx').then((m) => ({ default: m[name] })));
const ListingsAdmin = lazySection('ListingsAdmin');
const ProjectsAdmin = lazySection('ProjectsAdmin');
const MeetingsAdmin = lazySection('MeetingsAdmin');
const InquiriesAdmin = lazySection('InquiriesAdmin');
const FaqAdmin = lazySection('FaqAdmin');

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Protected({ children }) {
  const { isAdmin } = useStore();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-navy-900">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
  </div>
);

function PublicSite() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <Curtain key={`curtain-${location.pathname}`} />
      <AnimatePresence mode="wait" initial={false}>
        <PageWrap key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/meeting" element={<Meeting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrap>
      </AnimatePresence>
      <Footer />
      <Chatbot />
    </>
  );
}

function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-navy-900 px-6 text-center">
      <p className="font-display text-8xl font-semibold text-white/20">404</p>
      <h1 className="mt-2 text-3xl font-semibold !text-white">This page has moved out</h1>
      <p className="mt-3 text-white/60">The address you followed does not exist.</p>
      <a href="#/" className="btn-light mt-8">
        Back to home
      </a>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const inAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {inAdmin ? (
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <Protected>
                  <AdminLayout />
                </Protected>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="listings" element={<ListingsAdmin />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="meetings" element={<MeetingsAdmin />} />
              <Route path="inquiries" element={<InquiriesAdmin />} />
              <Route path="chatbot" element={<FaqAdmin />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      ) : (
        <PublicSite />
      )}
    </>
  );
}
