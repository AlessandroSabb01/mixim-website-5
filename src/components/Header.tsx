import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const serviceLinks = [
    { name: t('nav.webDesign'), path: '/services/web-design' },
    { name: t('nav.seo'), path: '/services/seo' },
    { name: t('nav.branding'), path: '/services/branding' },
    { name: t('nav.maintenance'), path: '/services/maintenance' },
  ];

  const navigationLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.process'), path: '/process' },
    { name: t('nav.portfolio'), path: '/portfolio' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isServiceActive = () => serviceLinks.some(link => location.pathname === link.path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-[#0f0f10]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Mixim
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Students Link */}
            <Link
              to="/studenti"
              className={`text-sm font-medium transition-colors ${
                isActive('/studenti')
                  ? 'text-purple-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {t('nav.students')}
            </Link>
            
            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    isServiceActive()
                      ? 'text-blue-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{t('nav.services')}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1b] border border-gray-800">
                {serviceLinks.map((service) => (
                  <DropdownMenuItem key={service.name} asChild>
                    <Link
                      to={service.path}
                      className="text-gray-300 hover:text-white focus:text-white"
                    >
                      {service.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Language Switcher & CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
                  <Globe className="h-4 w-4 mr-2" />
                  {language === 'it' ? 'IT' : 'EN'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1b] border border-gray-800">
                <DropdownMenuItem onClick={() => setLanguage('it')} className="text-gray-300 hover:text-white">
                  🇮🇹 Italiano
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="text-gray-300 hover:text-white">
                  🇬🇧 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/contact">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                {t('nav.consultation')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-800 py-4"
            >
              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-blue-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Services Submenu */}
                <div>
                  <button
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                    className={`flex items-center justify-center w-full text-sm font-medium transition-colors ${
                      isServiceActive()
                        ? 'text-blue-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="mr-2">{t('nav.services')}</span>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform ${
                        isMobileServicesOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence>
                    {isMobileServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 space-y-2"
                      >
                        {serviceLinks.map((service) => (
                          <Link
                            key={service.name}
                            to={service.path}
                            className="block text-sm text-gray-400 hover:text-white transition-colors"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileServicesOpen(false);
                            }}
                          >
                            {service.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Language Switcher */}
                <div className="flex justify-center space-x-4 py-2">
                  <button
                    onClick={() => setLanguage('it')}
                    className={`text-sm ${language === 'it' ? 'text-blue-500' : 'text-gray-400'}`}
                  >
                    🇮🇹 IT
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`text-sm ${language === 'en' ? 'text-blue-500' : 'text-gray-400'}`}
                  >
                    🇬🇧 EN
                  </button>
                </div>

                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    {t('nav.consultation')}
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}