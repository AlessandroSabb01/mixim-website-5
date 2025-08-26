import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Zap, CheckCircle, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import AIWebsitePlanner from '@/components/AIWebsitePlanner';

const dotBg = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function Home() {
  const { t } = useLanguage();

  const scrollToPlanner = () => {
    const element = document.getElementById('plan-my-website');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#0f0f10] via-[#1a1a1b] to-[#0f0f10] overflow-hidden">
        {/* Background Effects */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: dotBg }}
        ></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 text-sm px-4 py-2">
              {t('home.badge')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('home.hero.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('home.hero.title2')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/contact'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                >
                  {t('home.hero.cta1')}
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
                  onClick={scrollToPlanner}
                  className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
                >
                  {t('home.hero.cta2')}
                  <ArrowDown className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">100+</div>
                <div className="text-sm text-gray-400">{t('home.stats.projects')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-gray-400">{t('home.stats.clients')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">5★</div>
                <div className="text-sm text-gray-400">{t('home.stats.rating')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Website Planner */}
      <AIWebsitePlanner />

      {/* Services Overview */}
      <section className="py-20 bg-[#0f0f10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              {t('home.services.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.services.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎨",
                title: t('home.services.web.title'),
                description: t('home.services.web.desc'),
                price: t('home.services.web.price'),
                link: "/services/web-design"
              },
              {
                icon: "📈",
                title: t('home.services.seo.title'),
                description: t('home.services.seo.desc'),
                price: t('home.services.seo.price'),
                link: "/services/seo"
              },
              {
                icon: "🎯",
                title: t('home.services.branding.title'),
                description: t('home.services.branding.desc'),
                price: t('home.services.branding.price'),
                link: "/services/branding"
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
                  y: -5
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 hover:border-gray-700 transition-all duration-300 group cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 mb-4">
                      {service.description}
                    </CardDescription>
                    <div className="text-lg font-semibold text-green-400 mb-4">
                      {service.price}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button variant="outline" size="sm" className="group-hover:border-blue-500 group-hover:text-blue-400">
                        <Link to="/contact">
                          {t('home.services.cta')}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/portfolio">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  {t('home.services.viewAll')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Transparency */}
      <section className="py-20 bg-gradient-to-b from-[#0f0f10] to-[#1a1a1b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
              {t('home.pricing.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('home.pricing.title')}
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {t('home.pricing.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
                  y: -5
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">{t('home.pricing.web.title')}</h3>
                  <p className="text-gray-400 mb-4">{t('home.pricing.web.desc')}</p>
                  <Link to="/services/web-design">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button variant="outline" size="sm">{t('common.viewDetails')}</Button>
                    </motion.div>
                  </Link>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
                  y: -5
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 p-6">
                  <h3 className="text-xl font-semibold text-white mb-3">{t('home.pricing.seo.title')}</h3>
                  <p className="text-gray-400 mb-4">{t('home.pricing.seo.desc')}</p>
                  <Link to="/services/seo">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button variant="outline" size="sm">{t('common.learnMore')}</Button>
                    </motion.div>
                  </Link>
                </Card>
              </motion.div>
            </div>
            <p className="text-sm text-gray-500">
              {t('home.pricing.note')}
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-[#0f0f10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">
                {t('home.why.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('home.why.title')}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('home.why.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="h-8 w-8 text-yellow-500" />,
                  title: t('home.why.design.title'),
                  description: t('home.why.design.desc')
                },
                {
                  icon: <Users className="h-8 w-8 text-blue-500" />,
                  title: t('home.why.team.title'),
                  description: t('home.why.team.desc')
                },
                {
                  icon: <Zap className="h-8 w-8 text-purple-500" />,
                  title: t('home.why.delivery.title'),
                  description: t('home.why.delivery.desc')
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)",
                    y: -5
                  }}
                >
                  <Card className="bg-[#1a1a1b]/50 border-gray-800 text-center p-6">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex justify-center">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gradient-to-b from-[#0f0f10] to-[#1a1a1b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">
                {t('home.process.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('home.process.title')}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t('home.process.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: t('home.process.discovery.title'),
                  description: t('home.process.discovery.desc')
                },
                {
                  step: "02",
                  title: t('home.process.design.title'),
                  description: t('home.process.design.desc')
                },
                {
                  step: "03",
                  title: t('home.process.development.title'),
                  description: t('home.process.development.desc')
                },
                {
                  step: "04",
                  title: t('home.process.launch.title'),
                  description: t('home.process.launch.desc')
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
                    y: -5
                  }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                      {step.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent -translate-y-0.5"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0f0f10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {t('home.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marco Rossi",
                company: "TechStart Italia",
                content: t('home.testimonials.testimonial1'),
                rating: 5
              },
              {
                name: "Giulia Bianchi",
                company: "Agenzia Creativa",
                content: t('home.testimonials.testimonial2'),
                rating: 5
              },
              {
                name: "Alessandro Verdi",
                company: "Business Locale",
                content: t('home.testimonials.testimonial3'),
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
                  y: -5
                }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.company}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              {t('home.cta.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg">
                    {t('home.cta.start')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/portfolio">
                <motion.div 
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
                    {t('home.cta.portfolio')}
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}