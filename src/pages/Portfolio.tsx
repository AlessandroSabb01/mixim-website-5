import { motion } from 'framer-motion';
import { ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Portfolio() {
  const { t } = useLanguage();

  const projects = [
    {
      id: 1,
      title: "Marco Gabizon Atelier – Portfolio Photography Website",
      category: "Portfolio",
      description: "Sito portfolio elegante per fotografo di alta moda e ritratti, progettato per valorizzare ogni scatto con un design minimalista e sofisticato.",
      image: "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "SEO", "Responsive Design"],
      results: [
        "+75% visualizzazioni portfolio",
        "+50% richieste di preventivo",
        "+40% tempo di permanenza sul sito"
      ],
      date: "2024",
      link: "#"
    },
    {
      id: 2,
      title: "Colour Addict – Art & Color Consulting Website",
      category: "Art & Consulting",
      description: "Piattaforma creativa per artista e color consultant, con galleria interattiva e sistema di prenotazione consulenze personalizzate.",
      image: "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Booking System", "Gallery"],
      results: [
        "+85% prenotazioni online",
        "+60% engagement sui social",
        "+45% conversioni da visitatori"
      ],
      date: "2024",
      link: "#"
    },
    {
      id: 3,
      title: "Italiana Revisioni – Corporate Accounting Website",
      category: "Corporate",
      description: "Sito professionale per società di revisione contabile a Roma, con focus su credibilità e trasparenza dei servizi offerti.",
      image: "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Corporate Design", "SEO"],
      results: [
        "+90% credibilità percepita",
        "+55% contatti qualificati",
        "+35% tempo di permanenza"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 4,
      title: "Studio Associato De Petris – Tax & Legal Services",
      category: "Corporate",
      description: "Sito istituzionale per studio fiscale e tributario con 23 collaboratori, progettato per comunicare professionalità e competenza.",
      image: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Team Showcase", "Legal Compliance"],
      results: [
        "+70% autorevolezza online",
        "+65% richieste di consulenza",
        "+40% referral da clienti"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 5,
      title: "Alessandro Sabbadini – Personal Branding Landing",
      category: "Personal Branding",
      description: "Landing page di presentazione professionale elegante e moderna, progettata per valorizzare competenze e esperienza personale.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Personal Branding", "CTA Optimization"],
      results: [
        "+80% impression professionali",
        "+55% contatti business",
        "+45% engagement LinkedIn"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 6,
      title: "Universe Pixel Studio – Creative Studio Landing",
      category: "Creative Studio",
      description: "Landing page dinamica per studio creativo, con animazioni coinvolgenti e showcase dei progetti più innovativi.",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["Wix Studio", "Animations", "Creative Design", "Portfolio Showcase"],
      results: [
        "+95% impatto visivo",
        "+70% richieste di collaborazione",
        "+50% condivisioni social"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 7,
      title: "Orange Tree Home – Luxury Vacation Rental",
      category: "Hospitality",
      description: "Sito multilingua per casa vacanze di lusso all'Aventino, Roma, con sistema di prenotazione integrato e tour virtuale.",
      image: "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Multilingual", "Booking System"],
      results: [
        "+120% prenotazioni dirette",
        "+85% tasso di occupazione",
        "+60% valore medio prenotazione"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 8,
      title: "La Villa Mogador – Luxury Guesthouse Cap Ferret",
      category: "Hospitality",
      description: "Sito elegante per guesthouse di lusso a Cap Ferret, con focus sull'esperienza premium e la bellezza della location.",
      image: "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["Wix Studio", "Luxury Design", "French Market", "Mobile Optimized"],
      results: [
        "+110% prenotazioni internazionali",
        "+75% permanenza media",
        "+55% recensioni positive"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 9,
      title: "Les Doyens – Senior Citizens Association",
      category: "Non-Profit",
      description: "Sito accessibile per associazione dedicata alla terza età, con calendario eventi e sistema di iscrizione semplificato.",
      image: "https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["Wix Studio", "Accessibility", "Event Calendar", "Community Features"],
      results: [
        "+90% partecipazione eventi",
        "+65% nuove iscrizioni",
        "+40% engagement community"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 10,
      title: "L'Altra Roma – Cultural Association",
      category: "Non-Profit",
      description: "Piattaforma digitale per associazione culturale romana, con calendario eventi e sistema di membership integrato.",
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Event Management", "Cultural Content"],
      results: [
        "+85% partecipazione eventi culturali",
        "+70% membri attivi",
        "+50% visibilità online"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 11,
      title: "Odette Lafrance – Mindfulness & Wellness",
      category: "Wellness",
      description: "Sito zen e rilassante per coach mindfulness, con sistema di prenotazione sessioni e contenuti meditativi.",
      image: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Wellness Design", "Booking Integration"],
      results: [
        "+95% prenotazioni sessioni",
        "+80% retention clienti",
        "+60% referral word-of-mouth"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 12,
      title: "Kyrah Mindfulness – Meditation & Coaching",
      category: "Wellness",
      description: "Piattaforma mindfulness con design calmo e funzionale, ottimizzata per la prenotazione di sessioni di meditazione.",
      image: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Meditation Focus", "Calm Design"],
      results: [
        "+100% sessioni prenotate",
        "+75% soddisfazione clienti",
        "+55% programmi completati"
      ],
      date: "2025",
      link: "#"
    },
    {
      id: 13,
      title: "Style Notes from Italy – Fashion Blog",
      category: "Fashion Blog",
      description: "Blog di alta moda per boutique romana, scritto da Danielle DeVine, con focus su stile italiano e tendenze luxury.",
      image: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800",
      tags: ["WordPress", "Elementor Pro", "Fashion Blog", "Italian Style"],
      results: [
        "+150% lettori mensili",
        "+90% engagement sui post",
        "+65% traffico da social media"
      ],
      date: "2025",
      link: "#"
    }
  ];

  // Featured project (first one)
  const featuredProject = projects[0];
  const otherProjects = projects.slice(1);

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
              I Nostri Lavori
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Portfolio di Progetti Realizzati
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Scopri i nostri progetti più recenti e vedi come abbiamo aiutato aziende e professionisti 
              a trasformare la loro presenza digitale con soluzioni innovative e design d'impatto.
            </p>
          </motion.div>
        </div>

        {/* Featured Project */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] border-gray-800 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src={featuredProject.image}
                  alt={featuredProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <Badge className="absolute top-4 left-4 bg-black/80 text-white border-gray-600">
                  {featuredProject.category}
                </Badge>
                <Badge className="absolute top-4 right-4 bg-black/80 text-white border-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  {featuredProject.date}
                </Badge>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Progetto in Evidenza
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {featuredProject.title}
                </h2>
                <p className="text-gray-300 mb-6">
                  {featuredProject.description}
                </p>
                <div className="space-y-2 mb-6">
                  {featuredProject.results.map((result, index) => (
                    <div key={index} className="flex items-center text-green-400">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      <span className="text-sm">{result}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredProject.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {otherProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
            >
              <Card className="bg-[#1a1a1b] border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-300 group h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/80 text-white border-gray-600">
                      {project.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/80 text-gray-300 border-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {project.date}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    {project.results.slice(0, 2).map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center text-green-400 text-sm">
                        <ArrowRight className="h-3 w-3 mr-2" />
                        <span>{result}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Card className="bg-gradient-to-r from-[#1a1a1b] to-[#2a2a2b] border-gray-800 p-8">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">25+</div>
                <div className="text-sm text-gray-400">Progetti Completati</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-gray-400">Clienti Soddisfatti</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">3+</div>
                <div className="text-sm text-gray-400">Anni di Attività</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50 p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pronto a Iniziare il Tuo Progetto?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Unisciti ai nostri clienti di successo. Creiamo insieme qualcosa di straordinario 
              che generi risultati concreti per la tua attività.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Inizia il Tuo Progetto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                Prenota una Chiamata
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}