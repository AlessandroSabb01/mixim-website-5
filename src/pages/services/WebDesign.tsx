import { motion } from 'framer-motion';
import { Code, Palette, Smartphone, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WebDesign() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Palette className="h-6 w-6" />,
      title: t('webdesign.features.design.title'),
      description: t('webdesign.features.design.desc')
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: t('webdesign.features.responsive.title'),
      description: t('webdesign.features.responsive.desc')
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: t('webdesign.features.code.title'),
      description: t('webdesign.features.code.desc')
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('webdesign.features.performance.title'),
      description: t('webdesign.features.performance.desc')
    }
  ];

  const packages = [
    {
      name: t('webdesign.packages.starter.name'),
      price: "€1.080 - €1.560",
      description: t('webdesign.packages.starter.desc'),
      features: [
        t('webdesign.packages.starter.feature1'),
        t('webdesign.packages.starter.feature2'),
        t('webdesign.packages.starter.feature3'),
        t('webdesign.packages.starter.feature4'),
        t('webdesign.packages.starter.feature5'),
        t('webdesign.packages.starter.feature6')
      ],
      popular: false
    },
    {
      name: t('webdesign.packages.professional.name'),
      price: "€1.790 - €2.590",
      description: t('webdesign.packages.professional.desc'),
      features: [
        t('webdesign.packages.professional.feature1'),
        t('webdesign.packages.professional.feature2'),
        t('webdesign.packages.professional.feature3'),
        t('webdesign.packages.professional.feature4'),
        t('webdesign.packages.professional.feature5'),
        t('webdesign.packages.professional.feature6'),
        t('webdesign.packages.professional.feature7')
      ],
      popular: true
    },
    {
      name: t('webdesign.packages.enterprise.name'),
      price: "€3.600 - €6.500",
      description: t('webdesign.packages.enterprise.desc'),
      features: [
        t('webdesign.packages.enterprise.feature1'),
        t('webdesign.packages.enterprise.feature2'),
        t('webdesign.packages.enterprise.feature3'),
        t('webdesign.packages.enterprise.feature4'),
        t('webdesign.packages.enterprise.feature5'),
        t('webdesign.packages.enterprise.feature6'),
        t('webdesign.packages.enterprise.feature7')
      ],
      popular: false
    }
  ];

  const process = [
    {
      step: "01",
      title: t('webdesign.process.discovery.title'),
      description: t('webdesign.process.discovery.desc')
    },
    {
      step: "02",
      title: t('webdesign.process.design.title'),
      description: t('webdesign.process.design.desc')
    },
    {
      step: "03",
      title: t('webdesign.process.development.title'),
      description: t('webdesign.process.development.desc')
    },
    {
      step: "04",
      title: t('webdesign.process.launch.title'),
      description: t('webdesign.process.launch.desc')
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
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              {t('webdesign.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('webdesign.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('webdesign.hero.title')}
              {t('webdesign.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                    {t('webdesign.hero.cta1')}
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
                    {t('webdesign.hero.cta2')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('webdesign.features.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('webdesign.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 text-center p-6 h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center text-blue-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
              {t('webdesign.pricing.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('webdesign.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('webdesign.pricing.subtitle')}
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
                    ? "0 0 20px rgba(139, 92, 246, 0.4)" 
                    : "0 0 20px rgba(75, 85, 99, 0.3)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className={`${pkg.popular 
                  ? 'bg-gradient-to-b from-blue-900/20 to-purple-900/20 border-blue-600' 
                  : 'bg-[#1a1a1b] border-gray-800'
                } relative overflow-hidden`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-medium">
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
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
            <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
              {t('webdesign.process.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('webdesign.process.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('webdesign.process.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
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
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                    {step.step}
                  </div>
                  {index < process.length - 1 && (
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
            <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">
              {t('webdesign.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('webdesign.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                company: "TechStart Inc.",
                content: t('webdesign.testimonials.testimonial1'),
                rating: 5
              },
              {
                name: "Michael Chen",
                company: "Design Agency",
                content: t('webdesign.testimonials.testimonial2'),
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                company: "E-commerce Store",
                content: t('webdesign.testimonials.testimonial3'),
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
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t('webdesign.cta.title')}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('webdesign.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg">
                      {t('webdesign.cta.cta1')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/portfolio">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                      {t('webdesign.cta.cta2')}
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