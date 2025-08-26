import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ArrowRight } from 'lucide-react';
import emailjs from 'emailjs-com';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send email using EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Non fornito',
        company: formData.company || 'Non specificata',
        service: formData.service || 'Non specificato',
        budget: formData.budget || 'Non specificato',
        message: formData.message,
        to_email: 'studio.miximfx@gmail.com'
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast({
        title: "Messaggio inviato con successo!",
        description: "Ti risponderemo entro 1-2 giorni lavorativi.",
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        budget: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Errore nell'invio",
        description: "Si è verificato un errore. Riprova o contattaci direttamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your services and would like to schedule a consultation.");
    window.open(`https://wa.me/34637054490?text=${message}`, '_blank');
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Scrivici",
      content: "studio.miximfx@gmail.com",
      description: "Inviaci una email quando vuoi"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Chiamaci",
      content: "+34 637 05 44 90",
      description: "Ven-Sab-Lun dalle 9:00 alle 21:00"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Vieni a Trovarci",
      content: "Roma / Barcellona / Ginevra",
      description: "I nostri uffici internazionali"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Orari Ufficio",
      content: "Ven-Sab-Lun: 9:00 - 21:00",
      description: "Altri giorni: risposta entro 1-2 giorni lavorativi"
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
              {t('contact.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-[#1a1a1b] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">{t('contact.form.title')}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {t('contact.form.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">{t('contact.form.name')} *</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-[#2a2a2b] border-gray-700 text-white"
                          placeholder={t('contact.form.name')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">{t('contact.form.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-[#2a2a2b] border-gray-700 text-white"
                          placeholder="email@esempio.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-white">{t('contact.form.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-[#2a2a2b] border-gray-700 text-white"
                          placeholder="+39 02 1234 5678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-white">{t('contact.form.company')}</Label>
                        <Input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="bg-[#2a2a2b] border-gray-700 text-white"
                          placeholder={t('contact.form.company')}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="service" className="text-white">{t('contact.form.service')}</Label>
                        <Select onValueChange={(value) => setFormData({...formData, service: value})}>
                          <SelectTrigger className="bg-[#2a2a2b] border-gray-700 text-white">
                            <SelectValue placeholder={t('contact.form.service')} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a2a2b] border-gray-700">
                            <SelectItem value="web-design" className="text-white">Siti Web & Sviluppo</SelectItem>
                            <SelectItem value="seo" className="text-white">SEO</SelectItem>
                            <SelectItem value="branding" className="text-white">Branding & Grafica</SelectItem>
                            <SelectItem value="maintenance" className="text-white">Manutenzione</SelectItem>
                            <SelectItem value="multiple" className="text-white">Servizi Multipli</SelectItem>
                            <SelectItem value="consultation" className="text-white">Solo Consulenza</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget" className="text-white">{t('contact.form.budget')}</Label>
                        <Select onValueChange={(value) => setFormData({...formData, budget: value})}>
                          <SelectTrigger className="bg-[#2a2a2b] border-gray-700 text-white">
                            <SelectValue placeholder={t('contact.form.budget')} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a2a2b] border-gray-700">
                            <SelectItem value="<2k" className="text-white">Meno di 2.000€</SelectItem>
                            <SelectItem value="2k-5k" className="text-white">2.000€ - 5.000€</SelectItem>
                            <SelectItem value="5k-10k" className="text-white">5.000€ - 10.000€</SelectItem>
                            <SelectItem value="10k+" className="text-white">Oltre 10.000€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white">{t('contact.form.message')} *</Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="bg-[#2a2a2b] border-gray-700 text-white min-h-32"
                        placeholder="Raccontaci del tuo progetto, obiettivi, tempistiche e requisiti specifici..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>{t('contact.form.sending')}</>
                      ) : (
                        <>
                          {t('contact.form.send')}
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Alternative Contact Methods */}
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Preferisci parlare direttamente?</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={() => window.location.href = 'mailto:studio.miximfx@gmail.com'}
                        variant="outline" 
                        className="border-gray-600 text-white hover:bg-gray-800"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Invia Email
                      </Button>
                      <Button 
                        onClick={handleWhatsApp}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Prenota una Chiamata</CardTitle>
                  <CardDescription className="text-gray-300">
                    Prenota una consulenza gratuita di 30 minuti per discutere il tuo progetto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <a href="mailto:studio.miximfx@gmail.com?subject=Richiesta Consulenza Gratuita">
                      Prenota Consulenza Gratuita
                    </a>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-[#1a1a1b] border-gray-800 p-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-blue-500 mt-1">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                        <p className="text-gray-300 text-sm mb-1">{info.content}</p>
                        <p className="text-gray-400 text-xs">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Response Time */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-green-900/20 border-green-800/50 p-6">
                <CardContent className="text-center p-0">
                  <div className="text-2xl font-bold text-green-400 mb-2">1-2 Giorni</div>
                  <div className="text-sm text-gray-300 mb-2">Tempo di Risposta Medio</div>
                  <div className="text-xs text-gray-400">
                    Risposta garantita entro 1-2 giorni lavorativi
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">
              Domande Frequenti
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Domande? Abbiamo le Risposte
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Quanto tempo richiede un progetto tipico?",
                answer: "I tempi variano in base alla complessità. Un sito base richiede 2-4 settimane, progetti complessi 6-12 settimane. Forniremo una timeline dettagliata durante la consulenza iniziale."
              },
              {
                question: "Offrite supporto continuo dopo il lancio?",
                answer: "Sì! Offriamo piani di manutenzione completi per mantenere il tuo sito sicuro, aggiornato e performante. Tutti i progetti includono 30 giorni di supporto gratuito."
              },
              {
                question: "Cosa include la consulenza gratuita?",
                answer: "La consulenza include valutazione del progetto, discussione strategica, stima dei tempi e proposta dettagliata. Nessun obbligo, riceverai insights preziosi in ogni caso."
              },
              {
                question: "Lavorate con aziende di tutte le dimensioni?",
                answer: "Assolutamente! Lavoriamo con startup, PMI e grandi aziende. Il nostro approccio flessibile si adatta a progetti di qualsiasi dimensione e budget."
              }
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#1a1a1b] border-gray-800 p-6">
                  <h3 className="text-white font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}