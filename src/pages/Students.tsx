import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Students() {
  const { t } = useLanguage();

  const scrollToContact = () => {
    window.location.href = '/contact';
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20">
              <GraduationCap className="h-4 w-4 mr-2" />
              {t('students.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('students.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6">
              {t('students.title')}
              {t('students.subtitle')}
            </p>
            
            {/* Highlight Sconto */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-600/30 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6 text-green-400 mr-2" />
                <span className="text-2xl font-bold text-green-400">{t('students.discount')}</span>
              </div>
              <p className="text-gray-300 text-sm">Su tutti i servizi digitali - Verifica con documento studente</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  onClick={scrollToContact}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                >
                  {t('students.cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
                  onClick={() => window.open('https://wa.me/34637054490?text=Ciao! Sono uno studente interessato al vostro sconto del 25%. Vorrei maggiori informazioni sui vostri servizi.', '_blank')}
                >
                  {t('students.final.whatsapp')}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Offerta Speciale Studenti */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-green-900/20 to-purple-900/20 border-green-800/50 p-8">
              <div className="text-center mb-8">
                <GraduationCap className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Sconto Studenti del 25% su Tutti i Servizi
                </h2>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <p className="text-xl text-gray-300 text-center mb-8">
                  Crediamo che i giovani talenti meritino l'accesso ai migliori servizi digitali. 
                  Approfitta del nostro sconto esclusivo del 25% su tutti i nostri servizi: siti web, SEO, branding e manutenzione.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">25%</div>
                    <div className="text-sm text-gray-400">Sconto Studenti</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
                    <div className="text-sm text-gray-400">Servizi Disponibili</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
                    <div className="text-sm text-gray-400">Qualità Garantita</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* CTA Finale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800/50 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Inizia il Tuo Progetto con il 25% di Sconto
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Approfitta del nostro sconto esclusivo per studenti e trasforma le tue idee in realtà digitale. 
                Siti web, branding, SEO o manutenzione: scegli il servizio che fa per te.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    size="lg" 
                    onClick={scrollToContact}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Inizia il Tuo Progetto
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-gray-600 text-white hover:bg-gray-800"
                    onClick={() => window.open('https://wa.me/34637054490?text=Ciao! Sono uno studente interessato al vostro sconto del 25%. Vorrei maggiori informazioni sui vostri servizi.', '_blank')}
                  >
                    Chatta su WhatsApp
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}