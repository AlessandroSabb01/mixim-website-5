import { motion } from 'framer-motion';
import { Palette, Eye, Lightbulb, Heart, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Branding() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: t('branding.services.logo.title'),
      description: t('branding.services.logo.desc')
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: t('branding.services.identity.title'),
      description: t('branding.services.identity.desc')
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: t('branding.services.strategy.title'),
      description: t('branding.services.strategy.desc')
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: t('branding.services.materials.title'),
      description: t('branding.services.materials.desc')
    }
  ];

  const packages = [
    {
      name: t('branding.packages.logo.name'),
      price: "€360 - €520",
      description: t('branding.packages.logo.desc'),
      features: [
        t('branding.packages.logo.feature1'),
        t('branding.packages.logo.feature2'),
        t('branding.packages.logo.feature3'),
        t('branding.packages.logo.feature4'),
        t('branding.packages.logo.feature5')
      ],
      popular: false
    },
    {
      name: t('branding.packages.simple.name'),
      price: "€900 - €1.300",
      description: t('branding.packages.simple.desc'),
      features: [
        t('branding.packages.simple.feature1'),
        t('branding.packages.simple.feature2'),
        t('branding.packages.simple.feature3'),
        t('branding.packages.simple.feature4'),
        t('branding.packages.simple.feature5')
      ],
      popular: true
    },
    {
      name: t('branding.packages.complete.name'),
      price: "€1.800 - €2.600",
      description: t('branding.packages.complete.desc'),
      features: [
        t('branding.packages.complete.feature1'),
        t('branding.packages.complete.feature2'),
        t('branding.packages.complete.feature3'),
        t('branding.packages.complete.feature4'),
        t('branding.packages.complete.feature5')
      ],
      popular: false
    }
  ];

  const brandElements = [
    {
      title: t('branding.elements.logo.title'),
      description: t('branding.elements.logo.desc'),
      items: [
        t('branding.elements.logo.item1'),
        t('branding.elements.logo.item2'),
        t('branding.elements.logo.item3'),
        t('branding.elements.logo.item4')
      ]
    },
    {
      title: t('branding.elements.colors.title'),
      description: t('branding.elements.colors.desc'),
      items: [
        t('branding.elements.colors.item1'),
        t('branding.elements.colors.item2'),
        t('branding.elements.colors.item3'),
        t('branding.elements.colors.item4')
      ]
    },
    {
      title: t('branding.elements.typography.title'),
      description: t('branding.elements.typography.desc'),
      items: [
        t('branding.elements.typography.item1'),
        t('branding.elements.typography.item2'),
        t('branding.elements.typography.item3'),
        t('branding.elements.typography.item4')
      ]
    },
    {
      title: t('branding.elements.visual.title'),
      description: t('branding.elements.visual.desc'),
      items: [
        t('branding.elements.visual.item1'),
        t('branding.elements.visual.item2'),
        t('branding.elements.visual.item3'),
        t('branding.elements.visual.item4')
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
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              {t('branding.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('branding.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('branding.hero.title')}
              {t('branding.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg">
                    {t('branding.hero.cta1')}
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
                    {t('branding.hero.cta2')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Services Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.services.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('branding.services.subtitle')}
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
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 text-center p-6 h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-center text-purple-500">
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

        {/* Brand Elements Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">
              {t('branding.elements.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.elements.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('branding.elements.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {brandElements.map((element, index) => (
              <motion.div
                key={element.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">{element.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {element.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-2 gap-2">
                      {element.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-gray-300 text-sm">
                          <CheckCircle className="h-3 w-3 text-purple-500 mr-2 flex-shrink-0" />
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

        {/* Pricing Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
              {t('branding.pricing.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('branding.pricing.subtitle')}
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
                    ? "0 0 20px rgba(168, 85, 247, 0.4)" 
                    : "0 0 20px rgba(75, 85, 99, 0.3)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className={`${pkg.popular 
                  ? 'bg-gradient-to-b from-purple-900/20 to-pink-900/20 border-purple-600' 
                  : 'bg-[#1a1a1b] border-gray-800'
                } relative overflow-hidden`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-medium">
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
                          <CheckCircle className="h-4 w-4 text-purple-500 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${pkg.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
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
              {t('branding.process.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.process.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('branding.process.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                step: "01",
                title: t('branding.process.discovery.title'),
                description: t('branding.process.discovery.desc')
              },
              {
                step: "02",
                title: t('branding.process.strategy.title'),
                description: t('branding.process.strategy.desc')
              },
              {
                step: "03",
                title: t('branding.process.design.title'),
                description: t('branding.process.design.desc')
              },
              {
                step: "04",
                title: t('branding.process.refine.title'),
                description: t('branding.process.refine.desc')
              },
              {
                step: "05",
                title: t('branding.process.deliver.title'),
                description: t('branding.process.deliver.desc')
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                    {step.step}
                  </div>
                  {index < 4 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Portfolio Preview */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.portfolio.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('branding.portfolio.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "TechStart Inc.",
                industry: "Technology",
                image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
                description: t('branding.portfolio.project1')
              },
              {
                title: "Luxe Fashion",
                industry: "Fashion",
                image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800",
                description: t('branding.portfolio.project2')
              },
              {
                title: "Green Cafe",
                industry: "Food & Beverage",
                image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
                description: t('branding.portfolio.project3')
              }
            ].map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 overflow-hidden group cursor-pointer">
                  <div className="relative h-48">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className="absolute top-4 left-4 bg-black/80 text-white border-gray-600">
                      {project.industry}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {t('branding.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('branding.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Gonzalez",
                company: "Boutique Fashion Store",
                content: t('branding.testimonials.testimonial1'),
                rating: 5
              },
              {
                name: "Alex Chen",
                company: "Tech Startup",
                content: t('branding.testimonials.testimonial2'),
                rating: 5
              },
              {
                name: "Sophie Williams",
                company: "Interior Design Studio",
                content: t('branding.testimonials.testimonial3'),
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
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800/50 p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {t('branding.cta.title')}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('branding.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 text-lg">
                      {t('branding.cta.cta1')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/portfolio">
                  <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}>
                    <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                      {t('branding.cta.cta2')}
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