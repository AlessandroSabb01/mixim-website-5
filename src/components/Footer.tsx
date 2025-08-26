import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/50 bg-[#0a0a0b]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="text-2xl font-bold text-white leading-tight">
              MIXIM
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {t('footer.studio')}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/portfolio" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.portfolio')}</Link></li>
              <li><Link to="/studenti" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.students')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('nav.services')}</h3>
            <ul className="space-y-2">
              <li><Link to="/services/web-design" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.webDesign')}</Link></li>
              <li><Link to="/services/seo" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.seo')}</Link></li>
              <li><Link to="/services/branding" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.branding')}</Link></li>
              <li><Link to="/services/maintenance" className="text-gray-400 hover:text-white text-sm transition-colors">{t('nav.maintenance')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.contacts')}</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">studio.miximfx@gmail.com</span></li>
              <li><span className="text-gray-400 text-sm">+34 637 05 44 90</span></li>
              <li><span className="text-gray-400 text-sm">{t('footer.locations')}</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.follow')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Instagram</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Behance</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-400 text-sm">
            © {currentYear} {t('footer.copyright')} {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}