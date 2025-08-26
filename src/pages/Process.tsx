import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Rocket, 
  Settings, 
  Globe, 
  Search, 
  BarChart3, 
  Target,
  Shield,
  Zap,
  Image,
  AlertTriangle,
  Gauge,
  Link as LinkIcon,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = {
  setup: [
    { key: 'baselanguage', icon: Globe, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    { key: 'seo', icon: Search, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
    { key: 'indexing', icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
    { key: 'searchconsole', icon: BarChart3, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
    { key: 'googletags', icon: Sparkles, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
    { key: 'googleanalytics', icon: BarChart3, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
    { key: 'googlebusiness', icon: Target, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  ],
  maintenance: [
    { key: 'pluginsupdated', icon: Shield, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
    { key: 'pluginscleaned', icon: Settings, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    { key: 'imagesoptimized', icon: Image, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
    { key: '404', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
    { key: 'speedoptimized', icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
    { key: 'linkschecked', icon: LinkIcon, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  ]
};

export default function Process() {
  const { t } = useLanguage();

  return (
    <div className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-400 border-purple-500/20 text-sm px-6 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              {t('process.hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('process.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('process.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                  {t('process.hero.cta1')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                  {t('process.hero.cta2')}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Process Flow Visualization */}
        <div className="flex justify-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
              <Rocket className="h-8 w-8" />
            </div>
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-gray-400"
            >
              <ArrowRight className="h-6 w-6" />
            </motion.div>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-lg">
              <Settings className="h-8 w-8" />
            </div>
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="text-gray-400"
            >
              <ArrowRight className="h-6 w-6" />
            </motion.div>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg">
              <Gauge className="h-8 w-8" />
            </div>
          </motion.div>
        </div>

        {/* Service Sections */}
        <div className="space-y-24">
          {/* Setup Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
              >
                <Rocket className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('process.section.setup.title')}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {t('process.section.setup.description')}
              </p>
            </div>

            {/* Setup Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {services.setup.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
                    }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Card className={`bg-[#1a1a1b] border-gray-800 hover:border-blue-500/50 transition-all duration-300 h-full`}>
                      <CardHeader>
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${service.bgColor} ${service.borderColor} border mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <CardTitle className="text-white group-hover:text-blue-400 transition-colors duration-300">
                          {t(`process.item.${service.key}.title`)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {t(`process.item.${service.key}.description`)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Phase Connector */}
            <div className="flex justify-center my-16">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-gray-400"
              >
                <ArrowDown className="h-8 w-8" />
              </motion.div>
            </div>
          </motion.div>

          {/* Maintenance Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-blue-600 mb-6"
              >
                <Settings className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('process.section.maintenance.title')}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {t('process.section.maintenance.description')}
              </p>
            </div>

            {/* Maintenance Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.maintenance.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)"
                    }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Card className={`bg-[#1a1a1b] border-gray-800 hover:border-green-500/50 transition-all duration-300 h-full`}>
                      <CardHeader>
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${service.bgColor} ${service.borderColor} border mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <CardTitle className="text-white group-hover:text-green-400 transition-colors duration-300">
                          {t(`process.item.${service.key}.title`)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {t(`process.item.${service.key}.description`)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Success Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 mb-16"
        >
          <Card className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] border-gray-800 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Risultati Misurabili</h3>
              <p className="text-gray-400">I nostri processi generano risultati concreti</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { metric: "99.9%", label: "Uptime Garantito", color: "text-green-400" },
                { metric: "< 2s", label: "Tempo di Caricamento", color: "text-blue-400" },
                { metric: "+150%", label: "Traffico Medio", color: "text-purple-400" },
                { metric: "24/7", label: "Monitoraggio", color: "text-orange-400" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.metric}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.metric}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 p-12 relative overflow-hidden">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {t('process.cta.title')}
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  {t('process.cta.subtitle')}
                </p>
                
                <RouterLink to="/contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                      {t('process.cta.button')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </RouterLink>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}