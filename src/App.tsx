import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Portfolio from '@/pages/Portfolio';
import WebDesign from '@/pages/services/WebDesign';
import SEO from '@/pages/services/SEO';
import Branding from '@/pages/services/Branding';
import Maintenance from '@/pages/services/Maintenance';
import Process from '@/pages/Process';
import Students from '@/pages/Students';
import Contact from '@/pages/Contact';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider defaultTheme="dark" storageKey="mixim-ui-theme">
        <Router>
          <div className="min-h-screen bg-[#0f0f10] text-white">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/process" element={<Process />} />
                <Route path="/services/web-design" element={<WebDesign />} />
                <Route path="/services/seo" element={<SEO />} />
                <Route path="/services/branding" element={<Branding />} />
                <Route path="/services/maintenance" element={<Maintenance />} />
                <Route path="/studenti" element={<Students />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </Layout>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;