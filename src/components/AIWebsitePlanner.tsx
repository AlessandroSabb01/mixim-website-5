import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, Zap, Target, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

import emailjs from 'emailjs-com';

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function AIWebsitePlanner() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: '',
    goals: '',
    features: [],
    budget: '',
    timeline: '',
    description: ''
  });
  const [recommendation, setRecommendation] = useState(null);

  const businessTypes = [
    { value: 'restaurant', label: 'Ristorante/Bar' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'services', label: 'Servizi Professionali' },
    { value: 'portfolio', label: 'Portfolio/Creativo' },
    { value: 'blog', label: 'Blog/Contenuti' },
    { value: 'corporate', label: 'Aziendale' },
    { value: 'startup', label: 'Startup/Tech' },
    { value: 'nonprofit', label: 'No-profit' }
  ];

  const websiteGoals = [
    { value: 'leads', label: 'Generare contatti/lead' },
    { value: 'sales', label: 'Vendere prodotti online' },
    { value: 'brand', label: 'Aumentare brand awareness' },
    { value: 'info', label: 'Fornire informazioni' },
    { value: 'portfolio', label: 'Mostrare portfolio' },
    { value: 'booking', label: 'Prenotazioni online' }
  ];

  const websiteFeatures = [
    { value: 'contact-form', label: 'Form di contatto' },
    { value: 'booking', label: 'Sistema prenotazioni' },
    { value: 'ecommerce', label: 'Negozio online' },
    { value: 'blog', label: 'Blog/News' },
    { value: 'gallery', label: 'Galleria immagini' },
    { value: 'testimonials', label: 'Recensioni clienti' },
    { value: 'multilingual', label: 'Multilingua' },
    { value: 'analytics', label: 'Analytics avanzati' }
  ];

  const budgetRanges = [
    { value: '1200-1500', label: '1.200€ - 1.500€' },
    { value: '1500-2500', label: '1.500€ - 2.500€' },
    { value: '2500-4000', label: '2.500€ - 4.000€' },
    { value: '4000-7000', label: '4.000€ - 7.000€' },
    { value: '7000+', label: 'Oltre 7.000€' }
  ];

  const generateRecommendation = () => {
    let recommendedPackage = '';
    let estimatedPrice = '';
    let features = [];
    let timeline = '';

    // Logica di raccomandazione basata sui dati inseriti
    if (formData.businessType === 'restaurant' || formData.businessType === 'services') {
      if (formData.features.includes('booking')) {
        recommendedPackage = 'Sito Professionale';
        estimatedPrice = '€1.790 - €2.590';
        timeline = '4-6 settimane';
      } else {
        recommendedPackage = 'Sito Starter';
        estimatedPrice = '€1.080 - €1.560';
        timeline = '3-4 settimane';
      }
    } else if (formData.businessType === 'ecommerce') {
      recommendedPackage = 'Sito Enterprise E-commerce';
      estimatedPrice = '€3.600 - €6.500';
      timeline = '6-10 settimane';
    } else if (formData.businessType === 'portfolio' || formData.businessType === 'blog') {
      recommendedPackage = 'Sito Starter';
      estimatedPrice = '€1.080 - €1.560';
      timeline = '2-3 settimane';
    } else {
      recommendedPackage = 'Sito Professionale';
      estimatedPrice = '€1.790 - €2.590';
      timeline = '3-4 settimane';
    }

    // Aggiungi funzionalità raccomandate
    features = [
      'Design responsive',
      'SEO base incluso',
      'Form di contatto',
      'Integrazione social media',
      'Supporto 30 giorni'
    ];

    if (formData.features.includes('ecommerce')) {
      features.push('Sistema e-commerce', 'Pagamenti online', 'Gestione inventario');
    }
    if (formData.features.includes('booking')) {
      features.push('Sistema prenotazioni', 'Calendario integrato');
    }
    if (formData.features.includes('blog')) {
      features.push('Sistema blog/CMS', 'Gestione contenuti');
    }

    setRecommendation({
      package: recommendedPackage,
      price: estimatedPrice,
      timeline: timeline,
      features: features
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      generateRecommendation();
      setStep(4);
    }
  };

  const handleFeatureToggle = (feature) => {
    const updatedFeatures = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature];
    setFormData({ ...formData, features: updatedFeatures });
  };

  return (
    <section id="plan-my-website" className="py-20 bg-gradient-to-b from-[#1a1a1b] to-[#0f0f10]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="h-4 w-4 mr-2" />
                Pianificatore Sito Web AI
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Scopri il Pacchetto Perfetto per Te
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Rispondi a poche domande e ricevi una raccomandazione personalizzata 
                con prezzi trasparenti e tempi di consegna.
              </p>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progresso</span>
              <span className="text-sm text-gray-400">{step}/4</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="bg-[#1a1a1b] border-gray-800">
            <CardContent className="p-8">
              {/* Step 1: Business Type */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Che tipo di business hai?
                    </h3>
                    <p className="text-gray-400">
                      Questo ci aiuta a capire le tue esigenze specifiche
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {businessTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, businessType: type.value })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.businessType === type.value
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{type.label}</div>
                      </button>
                    ))}
                  </div>

                  <Button 
                    onClick={handleNext}
                    disabled={!formData.businessType}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Qual è il tuo obiettivo principale?
                    </h3>
                    <p className="text-gray-400">
                      Cosa vuoi ottenere con il tuo nuovo sito web?
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {websiteGoals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setFormData({ ...formData, goals: goal.value })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.goals === goal.value
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{goal.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                    >
                      Indietro
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!formData.goals}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continua
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Features & Budget */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <Palette className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Funzionalità e Budget
                    </h3>
                    <p className="text-gray-400">
                      Seleziona le funzionalità che ti servono e il tuo budget
                    </p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <Label className="text-white text-lg mb-4 block">
                        Funzionalità desiderate (seleziona tutte quelle che ti interessano):
                      </Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {websiteFeatures.map((feature) => (
                          <button
                            key={feature.value}
                            onClick={() => handleFeatureToggle(feature.value)}
                            className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                              formData.features.includes(feature.value)
                                ? 'border-green-500 bg-green-500/10 text-white'
                                : 'border-gray-700 hover:border-gray-600 text-gray-300'
                            }`}
                          >
                            <CheckCircle className={`h-4 w-4 inline mr-2 ${
                              formData.features.includes(feature.value) ? 'text-green-500' : 'text-gray-500'
                            }`} />
                            {feature.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-4 block">Budget indicativo:</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                        <SelectTrigger className="bg-[#2a2a2b] border-gray-700 text-white">
                          <SelectValue placeholder="Seleziona il tuo budget" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2b] border-gray-700">
                          {budgetRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} className="text-white">
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white text-lg mb-4 block">
                        Descrivi brevemente il tuo progetto (opzionale):
                      </Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-[#2a2a2b] border-gray-700 text-white"
                        placeholder="Es: Voglio un sito per il mio ristorante con menu online e sistema di prenotazioni..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                    >
                      Indietro
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={!formData.budget}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Ottieni Raccomandazione
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Recommendation */}
              {step === 4 && recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Ecco la Nostra Raccomandazione!
                    </h3>
                    <p className="text-gray-400">
                      Basata sulle tue esigenze, questo è il pacchetto perfetto per te
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/50 rounded-2xl p-6 mb-8">
                    <div className="text-center mb-6">
                      <h4 className="text-3xl font-bold text-white mb-2">{recommendation.package}</h4>
                      <div className="text-2xl font-bold text-green-400 mb-2">{recommendation.price}</div>
                      <div className="text-gray-300">Tempo di consegna: {recommendation.timeline}</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-lg font-semibold text-white mb-3">Incluso nel pacchetto:</h5>
                        <ul className="space-y-2">
                          {recommendation.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-300 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-white mb-3">Prossimi passi:</h5>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-center">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                            Consulenza gratuita di 30 minuti
                          </li>
                          <li className="flex items-center">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                            Preventivo dettagliato personalizzato
                          </li>
                          <li className="flex items-center">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
                            Inizio progetto e design
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-6">
                      Prezzi indicativi: il preventivo finale dipende da funzionalità e complessità specifiche.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        size="lg"
                        onClick={async () => {
                          try {
                            // Send recommendation data via email
                            const templateParams = {
                              from_name: 'AI Website Planner',
                              business_type: formData.businessType,
                              goals: formData.goals,
                              features: formData.features.join(', '),
                              budget: formData.budget,
                              description: formData.description,
                              recommended_package: recommendation.package,
                              estimated_price: recommendation.price,
                              timeline: recommendation.timeline,
                              to_email: 'studio.miximfx@gmail.com'
                            };

                            await emailjs.send(
                              EMAILJS_SERVICE_ID,
                              EMAILJS_TEMPLATE_ID,
                              templateParams,
                              EMAILJS_PUBLIC_KEY
                            );
                            
                            window.location.href = '/contact';
                          } catch (error) {
                            console.error('Error sending recommendation:', error);
                            window.location.href = '/contact';
                          }
                        }}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        Prenota Consulenza Gratuita
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}