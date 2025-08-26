import { motion } from 'framer-motion';
import { Shield, Zap, Heater as Update, HeadphonesIcon, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Maintenance() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('maintenance.services.security.title'),
      description: t('maintenance.services.security.desc')
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('maintenance.services.performance.title'),
      description: t('maintenance.services.performance.desc')
    },
    {
      icon: <Update className="h-6 w-6" />,
      title: t('maintenance.services.updates.title'),
      description: t('maintenance.services.updates.desc')
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      title: t('maintenance.services.support.title'),
      description: t('maintenance.services.support.desc')
    }
  ];

  const packages = [
    {
      name: t('maintenance.packages.standard.name'),
      price: "€180 - €260/mese",
      description: t('maintenance.packages.standard.desc'),
      features: [
        t('maintenance.packages.standard.feature1'),
        t('maintenance.packages.standard.feature2'),
        t('maintenance.packages.standard.feature3'),
        t('maintenance.packages.standard.feature4'),
        t('maintenance.packages.standard.feature5'),
        t('maintenance.packages.standard.feature6')
      ],
      popular: false
    },
    {
      name: t('maintenance.packages.professional.name'),
      price: "€270 - €520/mese",
      description: t('maintenance.packages.professional.desc'),
      features: [
        t('maintenance.packages.professional.feature1'),
        t('maintenance.packages.professional.feature2'),
        t('maintenance.packages.professional.feature3'),
        t('maintenance.packages.professional.feature4'),
        t('maintenance.packages.professional.feature5'),
        t('maintenance.packages.professional.feature6'),
        t('maintenance.packages.professional.feature7')
      ],
      popular: true
    }
  ];

  const included = [
    {
      category: t('maintenance.included.security.title'),
      items: [
        t('maintenance.included.security.item1'),
        t('maintenance.included.security.item2'),
        t('maintenance.included.security.item3'),
        t('maintenance.included.security.item4'),
        t('maintenance.included.security.item5')
      ]
    },
    {
      category: t('maintenance.included.performance.title'),
      items: [
        t('maintenance.included.performance.item1'),
        t('maintenance.included.performance.item2'),
        t('maintenance.included.performance.item3'),
        t('maintenance.included.performance.item4'),
        t('maintenance.included.performance.item5')
      ]
    },
    {
      category: t('maintenance.included.monitoring.title'),
      items: [
        t('maintenance.included.monitoring.item1'),
        t('maintenance.included.monitoring.item2'),
        t('maintenance.included.monitoring.item3'),
        t('maintenance.included.monitoring.item4'),
        t('maintenance.included.monitoring.item5')
      ]
    },
    {
      category: t('maintenance.included.support.title'),
      items: [
        t('maintenance.included.support.item1'),
        t('maintenance.included.support.item2'),
        t('maintenance.included.support.item3'),
        t('maintenance.included.support.item4'),
        t('maintenance.included.support.item5')
      ]
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
              {t('maintenance.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('maintenance.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('maintenance.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-4 text-lg">
                  {t('maintenance.hero.cta1')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                  {t('maintenance.hero.cta2')}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Why Maintenance Matters */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('maintenance.why.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('maintenance.why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(34, 197, 94, 0.4)",
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

        {/* Stats Section */}
        <section className="mb-20">
          <Card className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] border-gray-800 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { metric: "99.9%", description: t('maintenance.stats.uptime') },
                { metric: "2h", description: t('maintenance.stats.response') },
                { metric: "50+", description: t('maintenance.stats.websites') },
                { metric: "24/7", description: t('maintenance.stats.monitoring') }
              ].map((stat, index) => (
                <motion.div
                  key={stat.metric}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                    {stat.metric}
                  </div>
                  <div className="text-sm text-gray-400">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </section>

        {/* Pricing Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              {t('maintenance.pricing.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('maintenance.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('maintenance.pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: pkg.popular ? "0 0 20px rgba(34, 197, 94, 0.4)" : "0 0 20px rgba(75, 85, 99, 0.3)" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: pkg.popular 
                    ? "0 0 30px rgba(34, 197, 94, 0.5)" 
                    : "0 0 25px rgba(75, 85, 99, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <Card className={`${pkg.popular 
                  ? 'bg-gradient-to-b from-green-900/20 to-blue-900/20 border-green-600' 
                  : 'bg-[#1a1a1b] border-gray-800'
                } relative overflow-hidden h-full`}>
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
                    >
                      {t('common.getStarted')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What's Included Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('maintenance.included.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('maintenance.included.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {included.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(34, 197, 94, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-gray-300 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
              {t('maintenance.process.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('maintenance.process.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('maintenance.process.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: t('maintenance.process.audit.title'),
                description: t('maintenance.process.audit.desc')
              },
              {
                step: "02",
                title: t('maintenance.process.setup.title'),
                description: t('maintenance.process.setup.desc')
              },
              {
                step: "03",
                title: t('maintenance.process.maintenance.title'),
                description: t('maintenance.process.maintenance.desc')
              },
              {
                step: "04",
                title: t('maintenance.process.reporting.title'),
                description: t('maintenance.process.reporting.desc')
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
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

        {/* Emergency Support */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-800/50 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t('maintenance.emergency.title')}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('maintenance.emergency.subtitle')}
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-red-400 mb-2">2 Ore</div>
                  <div className="text-sm text-gray-400">{t('maintenance.emergency.response')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-400">{t('maintenance.emergency.monitoring')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">99.9%</div>
                  <div className="text-sm text-gray-400">{t('maintenance.emergency.uptime')}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {t('maintenance.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('maintenance.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Robert Kim",
                company: "E-commerce Store",
                content: t('maintenance.testimonials.testimonial1'),
                rating: 5
              },
              {
                name: "Jennifer Lopez",
                company: "Professional Services",
                content: t('maintenance.testimonials.testimonial2'),
                rating: 5
              },
              {
                name: "Tom Wilson",
                company: "Local Business",
                content: t('maintenance.testimonials.testimonial3'),
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(234, 179, 8, 0.3)",
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
              boxShadow: "0 0 40px rgba(34, 197, 94, 0.3)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-800/50 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t('maintenance.cta.title')}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('maintenance.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    {t('maintenance.cta.cta1')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                  <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                    {t('maintenance.cta.cta2')}
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