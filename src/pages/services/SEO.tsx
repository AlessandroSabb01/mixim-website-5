import { motion } from 'framer-motion';
import { Search, TrendingUp, Target, BarChart3, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SEO() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Search className="h-6 w-6" />,
      title: t('seo.services.keyword.title'),
      description: t('seo.services.keyword.desc')
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('seo.services.onpage.title'),
      description: t('seo.services.onpage.desc')
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: t('seo.services.technical.title'),
      description: t('seo.services.technical.desc')
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('seo.services.tracking.title'),
      description: t('seo.services.tracking.desc')
    }
  ];

  const packages = [
    {
      name: t('seo.packages.local.name'),
      price: "€270 - €390/mese",
      description: t('seo.packages.local.desc'),
      features: [
        t('seo.packages.local.feature1'),
        t('seo.packages.local.feature2'),
        t('seo.packages.local.feature3'),
        t('seo.packages.local.feature4'),
        t('seo.packages.local.feature5')
      ],
      popular: false
    },
    {
      name: t('seo.packages.single.name'),
      price: "€450 - €650/mese",
      description: t('seo.packages.single.desc'),
      features: [
        t('seo.packages.single.feature1'),
        t('seo.packages.single.feature2'),
        t('seo.packages.single.feature3'),
        t('seo.packages.single.feature4'),
        t('seo.packages.single.feature5')
      ],
      popular: true
    },
    {
      name: t('seo.packages.enterprise.name'),
      price: "€720 - €1.040/mese",
      description: t('seo.packages.enterprise.desc'),
      features: [
        t('seo.packages.enterprise.feature1'),
        t('seo.packages.enterprise.feature2'),
        t('seo.packages.enterprise.feature3'),
        t('seo.packages.enterprise.feature4'),
        t('seo.packages.enterprise.feature5')
      ],
      popular: false
    }
  ];

  const results = [
    {
      metric: "300%",
      description: t('seo.results.traffic')
    },
    {
      metric: "250%",
      description: t('seo.results.rankings')
    },
    {
      metric: "200%",
      description: t('seo.results.leads')
    },
    {
      metric: "150%",
      description: t('seo.results.conversions')
    }
  ];

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
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
              {t('seo.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('seo.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('seo.hero.title')}
              {t('seo.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 text-lg">
                    {t('seo.hero.cta1')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/portfolio">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                    {t('seo.hero.cta2')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Results Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('seo.results.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('seo.results.subtitle')}
            </p>
          </div>

          <Card className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] border-gray-800 p-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {results.map((result, index) => (
                <motion.div
                  key={result.metric}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                    {result.metric}
                  </div>
                  <div className="text-sm text-gray-400">{result.description}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </section>

        {/* Services Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('seo.services.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('seo.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 text-center p-6 h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center text-green-500">
                      {service.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                    <p className="text-gray-400 text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              {t('seo.pricing.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('seo.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('seo.pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: pkg.popular 
                    ? "0 0 20px rgba(34, 197, 94, 0.4)" 
                    : "0 0 20px rgba(75, 85, 99, 0.3)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className={`${pkg.popular 
                  ? 'bg-gradient-to-b from-green-900/20 to-blue-900/20 border-green-600' 
                  : 'bg-[#1a1a1b] border-gray-800'
                } relative overflow-hidden`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-1 text-sm font-medium">
                      {t('common.mostPopular')}
                    </div>
                  )}
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-white text-xl mb-2">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-white mb-2">{pkg.price}</div>
                    <CardDescription className="text-gray-400">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${pkg.popular 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => window.location.href = '/contact'}
                    >
                      {t('common.getStarted')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              {t('seo.process.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('seo.process.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('seo.process.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: t('seo.process.audit.title'),
                description: t('seo.process.audit.desc')
              },
              {
                step: "02",
                title: t('seo.process.strategy.title'),
                description: t('seo.process.strategy.desc')
              },
              {
                step: "03",
                title: t('seo.process.implementation.title'),
                description: t('seo.process.implementation.desc')
              },
              {
                step: "04",
                title: t('seo.process.monitor.title'),
                description: t('seo.process.monitor.desc')
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                    {step.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {t('seo.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('seo.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "David Thompson",
                company: "Local Restaurant",
                content: t('seo.testimonials.testimonial1'),
                rating: 5
              },
              {
                name: "Lisa Park",
                company: "E-commerce Store",
                content: t('seo.testimonials.testimonial2'),
                rating: 5
              },
              {
                name: "James Wilson",
                company: "Professional Services",
                content: t('seo.testimonials.testimonial3'),
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-400">{testimonial.company}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
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
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-800/50 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t('seo.cta.title')}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('seo.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 text-lg">
                      {t('seo.cta.cta1')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/portfolio">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                      {t('seo.cta.cta2')}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}