import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'it' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Servizi',
    'nav.portfolio': 'Portfolio',
    'nav.process': 'Processo',
    'nav.students': 'Studenti',
    'nav.contact': 'Contatti',
    'nav.consultation': 'Consulenza Gratuita',
    'nav.webDesign': 'Web Design',
    'nav.seo': 'SEO',
    'nav.branding': 'Branding',
    'nav.maintenance': 'Manutenzione',

    // Common
    'common.learnMore': 'Scopri di Più',
    'common.getStarted': 'Inizia Ora',
    'common.viewDetails': 'Vedi Dettagli',
    'common.mostPopular': 'Più Popolare',

    // Home Page
    'home.badge': '🚀 Studio Creativo Digitale',
    'home.hero.title1': 'Trasformiamo le Tue Idee in',
    'home.hero.title2': 'Successo Digitale',
    'home.hero.subtitle': 'Creiamo siti web straordinari, strategie SEO vincenti e brand memorabili che generano risultati concreti per la tua attività.',
    'home.hero.cta1': 'Inizia il Tuo Progetto',
    'home.hero.cta2': 'Scopri Come Funziona',
    'home.stats.projects': 'Progetti',
    'home.stats.clients': 'Clienti',
    'home.stats.rating': 'Valutazione',

    'home.services.badge': '💼 I Nostri Servizi',
    'home.services.title': 'Soluzioni Complete per il Tuo Business',
    'home.services.subtitle': 'Dalla creazione del sito web alla crescita online, offriamo tutto ciò di cui hai bisogno per dominare il mercato digitale.',
    'home.services.web.title': 'Siti Web & Sviluppo',
    'home.services.web.desc': 'Siti web professionali, responsive e ottimizzati per le conversioni',
    'home.services.web.price': 'da €1.080',
    'home.services.seo.title': 'SEO & Marketing',
    'home.services.seo.desc': 'Strategie SEO avanzate per dominare i risultati di ricerca',
    'home.services.seo.price': 'da €270/mese',
    'home.services.branding.title': 'Branding & Grafica',
    'home.services.branding.desc': 'Identità visive memorabili che distinguono il tuo brand',
    'home.services.branding.price': 'da €360',
    'home.services.cta': 'Scopri di Più',
    'home.services.viewAll': 'Vedi Tutti i Servizi',

    'home.pricing.badge': '💰 Prezzi Trasparenti',
    'home.pricing.title': 'Nessuna Sorpresa, Solo Risultati',
    'home.pricing.subtitle': 'Prezzi chiari e fissi per ogni progetto. Saprai esattamente cosa ricevi e quanto costa.',
    'home.pricing.web.title': 'Siti Web Professionali',
    'home.pricing.web.desc': 'Da €1.080 a €6.500 - Prezzi fissi basati su funzionalità e complessità',
    'home.pricing.seo.title': 'Servizi SEO Mensili',
    'home.pricing.seo.desc': 'Da €270 a €1.040/mese - Piani scalabili per ogni budget',
    'home.pricing.note': 'Tutti i prezzi sono IVA esclusa. Preventivi personalizzati disponibili.',

    'home.why.badge': '⭐ Perché Sceglierci',
    'home.why.title': 'La Differenza Mixim',
    'home.why.subtitle': 'Non siamo solo un altro studio digitale. Siamo i tuoi partner per il successo online.',
    'home.why.design.title': 'Design Che Converte',
    'home.why.design.desc': 'Ogni pixel è progettato per massimizzare conversioni e risultati',
    'home.why.team.title': 'Team Esperto',
    'home.why.team.desc': 'Professionisti con anni di esperienza in progetti di successo',
    'home.why.delivery.title': 'Consegna Rapida',
    'home.why.delivery.desc': 'Tempi di consegna rispettati e comunicazione costante',

    'home.process.badge': '🔄 Il Nostro Processo',
    'home.process.title': 'Come Lavoriamo',
    'home.process.subtitle': 'Un processo collaudato che garantisce risultati eccezionali per ogni progetto.',
    'home.process.discovery.title': 'Scoperta',
    'home.process.discovery.desc': 'Analizziamo i tuoi obiettivi e il mercato',
    'home.process.design.title': 'Design',
    'home.process.design.desc': 'Creiamo soluzioni su misura per te',
    'home.process.development.title': 'Sviluppo',
    'home.process.development.desc': 'Realizziamo tutto con la massima qualità',
    'home.process.launch.title': 'Lancio',
    'home.process.launch.desc': 'Pubblichiamo e monitoriamo i risultati',

    'home.testimonials.badge': '💬 Testimonianze',
    'home.testimonials.title': 'Cosa Dicono i Nostri Clienti',
    'home.testimonials.subtitle': 'Storie di successo reali da clienti che hanno trasformato il loro business con noi.',
    'home.testimonials.testimonial1': 'Mixim ha trasformato completamente la nostra presenza online. Il nostro sito ora converte 3 volte meglio di prima e abbiamo visto un aumento del 150% nei lead.',
    'home.testimonials.testimonial2': 'Il team di Mixim ha capito perfettamente la nostra visione. Hanno consegnato un sito web straordinario che rappresenta davvero il nostro brand e ha impressionato tutti i nostri clienti.',
    'home.testimonials.testimonial3': 'Professionali, creativi e affidabili. Mixim ci ha aiutato a stabilire una forte presenza digitale che ha significativamente aumentato la nostra base clienti.',

    'home.cta.badge': '🚀 Inizia Oggi',
    'home.cta.title': 'Pronto a Trasformare il Tuo Business?',
    'home.cta.subtitle': 'Unisciti a centinaia di aziende che hanno scelto Mixim per il loro successo digitale.',
    'home.cta.start': 'Inizia il Tuo Progetto',
    'home.cta.portfolio': 'Vedi il Portfolio',

    // Process Page
    'process.hero.badge': '🔄 Il Nostro Processo',
    'process.hero.title': 'La Nostra Metodologia Vincente',
    'process.hero.subtitle': 'Dalla Fondazione alla Crescita: Il Nostro Processo Digitale Collaudato che Trasforma le Idee in Successi Misurabili',

    'process.section.setup.title': 'Fase 1: Configurazione e Lancio del Tuo Successo',
    'process.section.setup.description': 'Costruiamo le fondamenta solide del tuo successo digitale con configurazioni tecniche avanzate e ottimizzazioni strategiche.',

    'process.section.maintenance.title': 'Fase 2: Manutenzione e Crescita Costante',
    'process.section.maintenance.description': 'Manteniamo e ottimizziamo continuamente la tua presenza digitale per garantire prestazioni eccellenti e crescita sostenibile.',

    'process.item.baselanguage.title': 'Configurazione Lingua Base',
    'process.item.baselanguage.description': 'Impostiamo la lingua principale del sito e configuriamo il supporto multilingua per raggiungere un pubblico globale.',

    'process.item.seo.title': 'Ottimizzazione SEO Avanzata',
    'process.item.seo.description': 'Implementiamo strategie SEO complete per migliorare la visibilità sui motori di ricerca e aumentare il traffico organico.',

    'process.item.indexing.title': 'Indicizzazione Motori di Ricerca',
    'process.item.indexing.description': 'Configuriamo e ottimizziamo l\'indicizzazione per garantire che il tuo sito sia facilmente trovabile dai motori di ricerca.',

    'process.item.searchconsole.title': 'Google Search Console',
    'process.item.searchconsole.description': 'Configuriamo e monitoriamo Google Search Console per tracciare le performance di ricerca e identificare opportunità di miglioramento.',

    'process.item.googletags.title': 'Google Tag Manager',
    'process.item.googletags.description': 'Implementiamo Google Tag Manager per una gestione avanzata dei tag di tracciamento e analisi comportamentale.',

    'process.item.googleanalytics.title': 'Google Analytics 4',
    'process.item.googleanalytics.description': 'Configuriamo Google Analytics 4 per un monitoraggio completo delle performance e del comportamento degli utenti.',

    'process.item.googlebusiness.title': 'Google Business Profile',
    'process.item.googlebusiness.description': 'Ottimizziamo il tuo profilo Google Business per migliorare la visibilità locale e attrarre più clienti nella tua zona.',

    'process.item.pluginsupdated.title': 'Aggiornamenti Plugin',
    'process.item.pluginsupdated.description': 'Manteniamo tutti i plugin aggiornati per garantire sicurezza, compatibilità e prestazioni ottimali del sito.',

    'process.item.pluginscleaned.title': 'Pulizia Plugin',
    'process.item.pluginscleaned.description': 'Rimuoviamo plugin inutilizzati e ottimizziamo quelli attivi per migliorare velocità e sicurezza del sito.',

    'process.item.imagesoptimized.title': 'Ottimizzazione Immagini',
    'process.item.imagesoptimized.description': 'Comprimiamo e ottimizziamo tutte le immagini per ridurre i tempi di caricamento senza compromettere la qualità.',

    'process.item.404.title': 'Gestione Errori 404',
    'process.item.404.description': 'Monitoriamo e correggiamo gli errori 404 per migliorare l\'esperienza utente e mantenere l\'autorità SEO.',

    'process.item.speedoptimized.title': 'Ottimizzazione Velocità',
    'process.item.speedoptimized.description': 'Implementiamo tecniche avanzate di ottimizzazione per garantire tempi di caricamento ultra-rapidi.',

    'process.item.linkschecked.title': 'Controllo Link',
    'process.item.linkschecked.description': 'Verifichiamo regolarmente tutti i link interni ed esterni per mantenere l\'integrità e l\'autorità del sito.',

    'process.cta.title': 'Pronto a Scalare il Tuo Successo Digitale?',
    'process.cta.subtitle': 'Inizia oggi il tuo percorso verso il dominio digitale con la nostra metodologia collaudata.',
    'process.cta.button': 'Inizia il Tuo Progetto',

    // Students Page
    'students.badge': 'Offerta Studenti',
    'students.title': 'Sconto Studenti del 25% su Tutti i Servizi',
    'students.subtitle': 'Crediamo nel potenziale dei giovani talenti. Approfitta del nostro sconto esclusivo del 25% su tutti i nostri servizi digitali.',
    'students.discount': 'SCONTO 25%',
    'students.cta.primary': 'Richiedi il Tuo Sconto',
    'students.final.whatsapp': 'Chatta su WhatsApp',

    // Contact Page
    'contact.badge': '📞 Contattaci',
    'contact.title': 'Iniziamo il Tuo Progetto',
    'contact.subtitle': 'Raccontaci la tua visione e trasformiamola insieme in realtà digitale. Consulenza gratuita di 30 minuti inclusa.',

    'contact.form.title': 'Invia la Tua Richiesta',
    'contact.form.subtitle': 'Compila il form e ti ricontatteremo entro 24 ore con un preventivo personalizzato.',
    'contact.form.name': 'Nome Completo',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Telefono',
    'contact.form.company': 'Azienda',
    'contact.form.service': 'Servizio di Interesse',
    'contact.form.budget': 'Budget Indicativo',
    'contact.form.message': 'Messaggio',
    'contact.form.send': 'Invia Richiesta',
    'contact.form.sending': 'Invio in corso...',

    // Web Design Page
    'webdesign.badge': '🎨 Web Design',
    'webdesign.hero.title': 'Siti Web Che Convertono e Impressionano',
    'webdesign.hero.subtitle': 'Creiamo esperienze digitali straordinarie che trasformano i visitatori in clienti fedeli. Design moderno, funzionalità avanzate e risultati misurabili.',
    'webdesign.hero.cta1': 'Inizia il Tuo Progetto',
    'webdesign.hero.cta2': 'Vedi il Portfolio',

    'webdesign.features.title': 'Caratteristiche dei Nostri Siti Web',
    'webdesign.features.subtitle': 'Ogni sito che creiamo è progettato per eccellere in performance, design e conversioni.',
    'webdesign.features.design.title': 'Design Personalizzato',
    'webdesign.features.design.desc': 'Design unici creati su misura per il tuo brand',
    'webdesign.features.responsive.title': 'Responsive Design',
    'webdesign.features.responsive.desc': 'Perfetto su tutti i dispositivi e schermi',
    'webdesign.features.code.title': 'Codice Pulito',
    'webdesign.features.code.desc': 'Sviluppo con le migliori pratiche e standard',
    'webdesign.features.performance.title': 'Performance Ottimali',
    'webdesign.features.performance.desc': 'Velocità di caricamento ultra-rapida',

    'webdesign.pricing.badge': '💰 Pacchetti e Prezzi',
    'webdesign.pricing.title': 'Soluzioni per Ogni Esigenza',
    'webdesign.pricing.subtitle': 'Scegli il pacchetto perfetto per il tuo progetto. Prezzi trasparenti e nessuna sorpresa.',

    'webdesign.packages.starter.name': 'Sito Starter',
    'webdesign.packages.starter.desc': 'Perfetto per piccole attività e professionisti',
    'webdesign.packages.starter.feature1': 'Design responsive personalizzato',
    'webdesign.packages.starter.feature2': 'Fino a 5 pagine',
    'webdesign.packages.starter.feature3': 'Form di contatto',
    'webdesign.packages.starter.feature4': 'SEO base incluso',
    'webdesign.packages.starter.feature5': 'Integrazione social media',
    'webdesign.packages.starter.feature6': 'Supporto 30 giorni',

    'webdesign.packages.professional.name': 'Sito Professionale',
    'webdesign.packages.professional.desc': 'Ideale per aziende in crescita',
    'webdesign.packages.professional.feature1': 'Tutto del pacchetto Starter',
    'webdesign.packages.professional.feature2': 'Fino a 10 pagine',
    'webdesign.packages.professional.feature3': 'Sistema di prenotazioni',
    'webdesign.packages.professional.feature4': 'Blog/News integrato',
    'webdesign.packages.professional.feature5': 'Analytics avanzati',
    'webdesign.packages.professional.feature6': 'Ottimizzazione velocità',
    'webdesign.packages.professional.feature7': 'Supporto 60 giorni',

    'webdesign.packages.enterprise.name': 'Sito Enterprise',
    'webdesign.packages.enterprise.desc': 'Per grandi aziende e e-commerce',
    'webdesign.packages.enterprise.feature1': 'Tutto del pacchetto Professionale',
    'webdesign.packages.enterprise.feature2': 'Pagine illimitate',
    'webdesign.packages.enterprise.feature3': 'E-commerce completo',
    'webdesign.packages.enterprise.feature4': 'Multilingua',
    'webdesign.packages.enterprise.feature5': 'Integrazioni personalizzate',
    'webdesign.packages.enterprise.feature6': 'Training team',
    'webdesign.packages.enterprise.feature7': 'Supporto 90 giorni',

    'webdesign.process.badge': '🔄 Il Nostro Processo',
    'webdesign.process.title': 'Come Creiamo il Tuo Sito',
    'webdesign.process.subtitle': 'Un processo collaudato che garantisce risultati eccezionali.',
    'webdesign.process.discovery.title': 'Scoperta',
    'webdesign.process.discovery.desc': 'Analizziamo i tuoi obiettivi e il target',
    'webdesign.process.design.title': 'Design',
    'webdesign.process.design.desc': 'Creiamo mockup e prototipi',
    'webdesign.process.development.title': 'Sviluppo',
    'webdesign.process.development.desc': 'Sviluppiamo il sito con tecnologie moderne',
    'webdesign.process.launch.title': 'Lancio',
    'webdesign.process.launch.desc': 'Testiamo e pubblichiamo il sito',

    'webdesign.testimonials.badge': '💬 Testimonianze',
    'webdesign.testimonials.title': 'Cosa Dicono i Nostri Clienti',
    'webdesign.testimonials.testimonial1': 'Il sito creato da Mixim ha superato tutte le nostre aspettative. Design straordinario e funzionalità perfette.',
    'webdesign.testimonials.testimonial2': 'Professionali e creativi. Hanno trasformato la nostra visione in un sito web che converte davvero.',
    'webdesign.testimonials.testimonial3': 'Ottimo lavoro di squadra. Il nostro nuovo sito ha aumentato le vendite del 200% in 3 mesi.',

    'webdesign.cta.title': 'Pronto per il Tuo Nuovo Sito Web?',
    'webdesign.cta.subtitle': 'Iniziamo oggi a creare il sito web dei tuoi sogni. Consulenza gratuita inclusa.',
    'webdesign.cta.cta1': 'Inizia il Progetto',
    'webdesign.cta.cta2': 'Vedi Altri Lavori',

    // SEO Page
    'seo.badge': '📈 SEO',
    'seo.hero.title': 'Domina Google con la Nostra SEO',
    'seo.hero.subtitle': 'Strategie SEO avanzate che portano il tuo sito in prima pagina e trasformano le ricerche in clienti paganti.',
    'seo.hero.cta1': 'Inizia la Tua Strategia SEO',
    'seo.hero.cta2': 'Vedi i Risultati',

    'seo.results.title': 'Risultati Che Parlano Chiaro',
    'seo.results.subtitle': 'I numeri dei nostri clienti dimostrano l\'efficacia delle nostre strategie SEO.',
    'seo.results.traffic': 'Aumento Traffico Organico',
    'seo.results.rankings': 'Miglioramento Posizioni',
    'seo.results.leads': 'Incremento Lead Qualificati',
    'seo.results.conversions': 'Crescita Conversioni',

    'seo.services.title': 'I Nostri Servizi SEO',
    'seo.services.subtitle': 'Strategie complete per dominare i risultati di ricerca.',
    'seo.services.keyword.title': 'Ricerca Parole Chiave',
    'seo.services.keyword.desc': 'Identifichiamo le keywords più profittevoli',
    'seo.services.onpage.title': 'SEO On-Page',
    'seo.services.onpage.desc': 'Ottimizziamo ogni elemento del tuo sito',
    'seo.services.technical.title': 'SEO Tecnica',
    'seo.services.technical.desc': 'Risolviamo problemi tecnici che limitano il ranking',
    'seo.services.tracking.title': 'Monitoraggio e Report',
    'seo.services.tracking.desc': 'Tracciamo i progressi con report dettagliati',

    'seo.pricing.badge': '💰 Pacchetti SEO',
    'seo.pricing.title': 'Piani SEO per Ogni Budget',
    'seo.pricing.subtitle': 'Scegli il piano perfetto per far crescere la tua visibilità online.',

    'seo.packages.local.name': 'SEO Locale',
    'seo.packages.local.desc': 'Perfetto per attività locali',
    'seo.packages.local.feature1': 'Ottimizzazione Google My Business',
    'seo.packages.local.feature2': 'SEO per ricerche locali',
    'seo.packages.local.feature3': 'Gestione recensioni',
    'seo.packages.local.feature4': 'Report mensili',
    'seo.packages.local.feature5': 'Supporto email',

    'seo.packages.single.name': 'SEO Nazionale',
    'seo.packages.single.desc': 'Per aziende che vogliono crescere',
    'seo.packages.single.feature1': 'Ricerca parole chiave avanzata',
    'seo.packages.single.feature2': 'Ottimizzazione on-page completa',
    'seo.packages.single.feature3': 'Link building di qualità',
    'seo.packages.single.feature4': 'Content marketing',
    'seo.packages.single.feature5': 'Report dettagliati',

    'seo.packages.enterprise.name': 'SEO Enterprise',
    'seo.packages.enterprise.desc': 'Per grandi aziende e e-commerce',
    'seo.packages.enterprise.feature1': 'Strategia SEO personalizzata',
    'seo.packages.enterprise.feature2': 'SEO tecnica avanzata',
    'seo.packages.enterprise.feature3': 'Ottimizzazione e-commerce',
    'seo.packages.enterprise.feature4': 'Consulenza strategica',
    'seo.packages.enterprise.feature5': 'Account manager dedicato',

    'seo.process.badge': '🔄 Processo SEO',
    'seo.process.title': 'Come Lavoriamo',
    'seo.process.subtitle': 'Un approccio sistematico per risultati garantiti.',
    'seo.process.audit.title': 'Audit SEO',
    'seo.process.audit.desc': 'Analizziamo il tuo sito e la concorrenza',
    'seo.process.strategy.title': 'Strategia',
    'seo.process.strategy.desc': 'Creiamo un piano personalizzato',
    'seo.process.implementation.title': 'Implementazione',
    'seo.process.implementation.desc': 'Applichiamo le ottimizzazioni',
    'seo.process.monitor.title': 'Monitoraggio',
    'seo.process.monitor.desc': 'Tracciamo e miglioriamo i risultati',

    'seo.testimonials.badge': '💬 Testimonianze',
    'seo.testimonials.title': 'Storie di Successo SEO',
    'seo.testimonials.testimonial1': 'In 6 mesi siamo passati dalla seconda pagina alla prima posizione per le nostre keywords principali.',
    'seo.testimonials.testimonial2': 'Il traffico organico è triplicato e le vendite online sono aumentate del 150%. Risultati incredibili!',
    'seo.testimonials.testimonial3': 'Finalmente un team SEO che mantiene le promesse. Professionalità e risultati concreti.',

    'seo.cta.title': 'Pronto a Dominare Google?',
    'seo.cta.subtitle': 'Inizia oggi la tua strategia SEO vincente. Analisi gratuita del tuo sito inclusa.',
    'seo.cta.cta1': 'Richiedi Analisi Gratuita',
    'seo.cta.cta2': 'Vedi Case Studies',

    // Branding Page
    'branding.badge': '🎯 Branding',
    'branding.hero.title': 'Brand Memorabili Che Conquistano',
    'branding.hero.subtitle': 'Creiamo identità visive potenti che distinguono il tuo brand dalla concorrenza e creano connessioni emotive durature.',
    'branding.hero.cta1': 'Crea il Tuo Brand',
    'branding.hero.cta2': 'Vedi i Nostri Lavori',

    'branding.services.title': 'Servizi di Branding',
    'branding.services.subtitle': 'Tutto ciò di cui hai bisogno per un brand di successo.',
    'branding.services.logo.title': 'Logo Design',
    'branding.services.logo.desc': 'Loghi memorabili che rappresentano la tua essenza',
    'branding.services.identity.title': 'Identità Visiva',
    'branding.services.identity.desc': 'Sistema completo di elementi visivi coordinati',
    'branding.services.strategy.title': 'Strategia Brand',
    'branding.services.strategy.desc': 'Posizionamento e messaggi che colpiscono nel segno',
    'branding.services.materials.title': 'Materiali Marketing',
    'branding.services.materials.desc': 'Brochure, biglietti da visita e materiali promozionali',

    'branding.elements.badge': '🎨 Elementi del Brand',
    'branding.elements.title': 'Cosa Include il Tuo Brand',
    'branding.elements.subtitle': 'Ogni elemento è progettato per rafforzare la tua identità.',
    'branding.elements.logo.title': 'Logo e Marchio',
    'branding.elements.logo.desc': 'Il simbolo distintivo del tuo brand',
    'branding.elements.logo.item1': 'Logo principale',
    'branding.elements.logo.item2': 'Varianti colore',
    'branding.elements.logo.item3': 'Versioni responsive',
    'branding.elements.logo.item4': 'Linee guida uso',
    'branding.elements.colors.title': 'Palette Colori',
    'branding.elements.colors.desc': 'Colori che comunicano la tua personalità',
    'branding.elements.colors.item1': 'Colori primari',
    'branding.elements.colors.item2': 'Colori secondari',
    'branding.elements.colors.item3': 'Codici esadecimali',
    'branding.elements.colors.item4': 'Combinazioni consigliate',
    'branding.elements.typography.title': 'Tipografia',
    'branding.elements.typography.desc': 'Font che riflettono il tuo carattere',
    'branding.elements.typography.item1': 'Font principale',
    'branding.elements.typography.item2': 'Font secondario',
    'branding.elements.typography.item3': 'Gerarchia testi',
    'branding.elements.typography.item4': 'Linee guida uso',
    'branding.elements.visual.title': 'Elementi Visivi',
    'branding.elements.visual.desc': 'Grafiche e pattern distintivi',
    'branding.elements.visual.item1': 'Pattern e texture',
    'branding.elements.visual.item2': 'Icone personalizzate',
    'branding.elements.visual.item3': 'Stile fotografico',
    'branding.elements.visual.item4': 'Elementi grafici',

    'branding.pricing.badge': '💰 Pacchetti Branding',
    'branding.pricing.title': 'Investimenti per il Tuo Brand',
    'branding.pricing.subtitle': 'Soluzioni complete per ogni fase del tuo business.',

    'branding.packages.logo.name': 'Solo Logo',
    'branding.packages.logo.desc': 'Perfetto per startup e piccole attività',
    'branding.packages.logo.feature1': 'Logo design personalizzato',
    'branding.packages.logo.feature2': '3 concept iniziali',
    'branding.packages.logo.feature3': '2 revisioni incluse',
    'branding.packages.logo.feature4': 'File in tutti i formati',
    'branding.packages.logo.feature5': 'Consegna in 7 giorni',

    'branding.packages.simple.name': 'Branding Semplice',
    'branding.packages.simple.desc': 'Identità completa per aziende in crescita',
    'branding.packages.simple.feature1': 'Logo + 2 varianti',
    'branding.packages.simple.feature2': 'Palette colori (5 colori)',
    'branding.packages.simple.feature3': 'Tipografia (2 font)',
    'branding.packages.simple.feature4': 'Biglietto da visita',
    'branding.packages.simple.feature5': 'Brand guidelines base',

    'branding.packages.complete.name': 'Branding Completo',
    'branding.packages.complete.desc': 'Identità premium per brand ambiziosi',
    'branding.packages.complete.feature1': 'Logo + 5 varianti',
    'branding.packages.complete.feature2': 'Palette estesa (10+ colori)',
    'branding.packages.complete.feature3': 'Sistema tipografico completo',
    'branding.packages.complete.feature4': 'Materiali marketing (5 pezzi)',
    'branding.packages.complete.feature5': 'Brand guidelines complete',

    'branding.process.badge': '🔄 Processo Creativo',
    'branding.process.title': 'Come Creiamo il Tuo Brand',
    'branding.process.subtitle': 'Un processo creativo che porta a risultati straordinari.',
    'branding.process.discovery.title': 'Scoperta',
    'branding.process.discovery.desc': 'Esploriamo la tua visione e valori',
    'branding.process.strategy.title': 'Strategia',
    'branding.process.strategy.desc': 'Definiamo posizionamento e messaggi',
    'branding.process.design.title': 'Design',
    'branding.process.design.desc': 'Creiamo l\'identità visiva',
    'branding.process.refine.title': 'Raffinamento',
    'branding.process.refine.desc': 'Perfezioniamo ogni dettaglio',
    'branding.process.deliver.title': 'Consegna',
    'branding.process.deliver.desc': 'Forniamo tutti i file e guidelines',

    'branding.portfolio.title': 'I Nostri Progetti di Branding',
    'branding.portfolio.subtitle': 'Scopri come abbiamo trasformato brand e aziende.',
    'branding.portfolio.project1': 'Rebranding completo per startup tecnologica',
    'branding.portfolio.project2': 'Identità luxury per brand di moda',
    'branding.portfolio.project3': 'Brand identity per catena di caffetterie',
    'branding.portfolio.viewCase': 'Vedi Case Study',

    'branding.testimonials.badge': '💬 Testimonianze',
    'branding.testimonials.title': 'Brand di Successo',
    'branding.testimonials.testimonial1': 'Il nuovo brand ha trasformato completamente la percezione della nostra azienda. Clienti e partner sono rimasti colpiti.',
    'branding.testimonials.testimonial2': 'Creatività e professionalità al top. Hanno catturato perfettamente l\'essenza del nostro brand.',
    'branding.testimonials.testimonial3': 'Investimento che ha ripagato immediatamente. Il nuovo brand ci ha aiutato a distinguerci dalla concorrenza.',

    'branding.cta.title': 'Pronto per un Brand Memorabile?',
    'branding.cta.subtitle': 'Iniziamo a creare l\'identità che farà innamorare i tuoi clienti del tuo brand.',
    'branding.cta.cta1': 'Crea il Tuo Brand',
    'branding.cta.cta2': 'Vedi Altri Progetti',

    // Maintenance Page
    'maintenance.badge': '🛠️ Manutenzione',
    'maintenance.hero.title': 'Mantieni il Tuo Sito Sempre al Top',
    'maintenance.hero.subtitle': 'Servizi di manutenzione professionale per garantire sicurezza, velocità e prestazioni ottimali del tuo sito web.',
    'maintenance.hero.cta1': 'Inizia la Manutenzione',
    'maintenance.hero.cta2': 'Scopri i Piani',

    'maintenance.why.title': 'Perché la Manutenzione è Fondamentale',
    'maintenance.why.subtitle': 'Un sito web richiede cure costanti per rimanere sicuro e performante.',
    'maintenance.services.security.title': 'Sicurezza',
    'maintenance.services.security.desc': 'Protezione da malware e attacchi informatici',
    'maintenance.services.performance.title': 'Performance',
    'maintenance.services.performance.desc': 'Ottimizzazione continua della velocità',
    'maintenance.services.updates.title': 'Aggiornamenti',
    'maintenance.services.updates.desc': 'Plugin e sistema sempre aggiornati',
    'maintenance.services.support.title': 'Supporto',
    'maintenance.services.support.desc': 'Assistenza tecnica quando ne hai bisogno',

    'maintenance.stats.uptime': 'Uptime Garantito',
    'maintenance.stats.response': 'Tempo di Risposta',
    'maintenance.stats.websites': 'Siti in Gestione',
    'maintenance.stats.monitoring': 'Monitoraggio',

    'maintenance.pricing.badge': '💰 Piani Manutenzione',
    'maintenance.pricing.title': 'Piani per Ogni Esigenza',
    'maintenance.pricing.subtitle': 'Scegli il piano perfetto per mantenere il tuo sito sempre al massimo.',

    'maintenance.packages.standard.name': 'Manutenzione Standard',
    'maintenance.packages.standard.desc': 'Perfetto per siti web aziendali',
    'maintenance.packages.standard.feature1': 'Backup settimanali',
    'maintenance.packages.standard.feature2': 'Aggiornamenti mensili',
    'maintenance.packages.standard.feature3': 'Monitoraggio uptime',
    'maintenance.packages.standard.feature4': 'Scansione malware',
    'maintenance.packages.standard.feature5': 'Supporto email',
    'maintenance.packages.standard.feature6': 'Report mensili',

    'maintenance.packages.professional.name': 'Manutenzione Professionale',
    'maintenance.packages.professional.desc': 'Per siti business e e-commerce',
    'maintenance.packages.professional.feature1': 'Backup giornalieri',
    'maintenance.packages.professional.feature2': 'Aggiornamenti settimanali',
    'maintenance.packages.professional.feature3': 'Monitoraggio 24/7',
    'maintenance.packages.professional.feature4': 'Ottimizzazione velocità',
    'maintenance.packages.professional.feature5': 'Supporto prioritario',
    'maintenance.packages.professional.feature6': 'Report settimanali',
    'maintenance.packages.professional.feature7': 'Piccole modifiche incluse',

    'maintenance.included.title': 'Cosa Include la Manutenzione',
    'maintenance.included.subtitle': 'Servizi completi per la salute del tuo sito.',
    'maintenance.included.security.title': 'Sicurezza',
    'maintenance.included.security.item1': 'Scansione malware',
    'maintenance.included.security.item2': 'Firewall configurazione',
    'maintenance.included.security.item3': 'Backup automatici',
    'maintenance.included.security.item4': 'Aggiornamenti sicurezza',
    'maintenance.included.security.item5': 'Monitoraggio intrusioni',
    'maintenance.included.performance.title': 'Performance',
    'maintenance.included.performance.item1': 'Ottimizzazione velocità',
    'maintenance.included.performance.item2': 'Compressione immagini',
    'maintenance.included.performance.item3': 'Cache ottimizzazione',
    'maintenance.included.performance.item4': 'Database pulizia',
    'maintenance.included.performance.item5': 'CDN configurazione',
    'maintenance.included.monitoring.title': 'Monitoraggio',
    'maintenance.included.monitoring.item1': 'Uptime monitoring',
    'maintenance.included.monitoring.item2': 'Performance tracking',
    'maintenance.included.monitoring.item3': 'Error monitoring',
    'maintenance.included.monitoring.item4': 'SEO monitoring',
    'maintenance.included.monitoring.item5': 'Report automatici',
    'maintenance.included.support.title': 'Supporto',
    'maintenance.included.support.item1': 'Supporto tecnico',
    'maintenance.included.support.item2': 'Piccole modifiche',
    'maintenance.included.support.item3': 'Consulenza strategica',
    'maintenance.included.support.item4': 'Training utenti',
    'maintenance.included.support.item5': 'Documentazione',

    'maintenance.process.badge': '🔄 Processo Manutenzione',
    'maintenance.process.title': 'Come Gestiamo il Tuo Sito',
    'maintenance.process.subtitle': 'Un approccio sistematico per risultati garantiti.',
    'maintenance.process.audit.title': 'Audit Iniziale',
    'maintenance.process.audit.desc': 'Analizziamo lo stato attuale del sito',
    'maintenance.process.setup.title': 'Configurazione',
    'maintenance.process.setup.desc': 'Impostiamo tutti i sistemi di monitoraggio',
    'maintenance.process.maintenance.title': 'Manutenzione',
    'maintenance.process.maintenance.desc': 'Eseguiamo le attività programmate',
    'maintenance.process.reporting.title': 'Reporting',
    'maintenance.process.reporting.desc': 'Ti teniamo informato sui progressi',

    'maintenance.emergency.title': 'Supporto di Emergenza',
    'maintenance.emergency.subtitle': 'Siamo qui quando ne hai più bisogno.',
    'maintenance.emergency.response': 'Tempo di Risposta',
    'maintenance.emergency.monitoring': 'Monitoraggio',
    'maintenance.emergency.uptime': 'Uptime Garantito',

    'maintenance.testimonials.badge': '💬 Testimonianze',
    'maintenance.testimonials.title': 'Clienti Soddisfatti',
    'maintenance.testimonials.testimonial1': 'Da quando abbiamo attivato la manutenzione, il nostro sito non ha mai avuto problemi. Servizio impeccabile.',
    'maintenance.testimonials.testimonial2': 'Professionalità e rapidità nell\'intervento. Il nostro sito è sempre veloce e sicuro.',
    'maintenance.testimonials.testimonial3': 'Investimento che vale ogni euro. Dormiamo sonni tranquilli sapendo che il sito è in buone mani.',

    'maintenance.cta.title': 'Proteggi il Tuo Investimento Digitale',
    'maintenance.cta.subtitle': 'Non lasciare che problemi tecnici danneggino il tuo business. Inizia oggi la manutenzione professionale.',
    'maintenance.cta.cta1': 'Attiva la Manutenzione',
    'maintenance.cta.cta2': 'Richiedi Preventivo',

    // Footer
    'footer.studio': 'Creative Studio',
    'footer.navigation': 'Navigazione',
    'footer.contacts': 'Contatti',
    'footer.follow': 'Seguici',
    'footer.locations': 'Roma / Barcellona / Ginevra',
    'footer.copyright': 'Mixim Creative Studio.',
    'footer.rights': 'Tutti i diritti riservati.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.process': 'Process',
    'nav.students': 'Students',
    'nav.contact': 'Contact',
    'nav.consultation': 'Free Consultation',
    'nav.webDesign': 'Web Design',
    'nav.seo': 'SEO',
    'nav.branding': 'Branding',
    'nav.maintenance': 'Maintenance',

    // Common
    'common.learnMore': 'Learn More',
    'common.getStarted': 'Get Started',
    'common.viewDetails': 'View Details',
    'common.mostPopular': 'Most Popular',

    // Home Page
    'home.badge': '🚀 Digital Creative Studio',
    'home.hero.title1': 'Transform Your Ideas into',
    'home.hero.title2': 'Digital Success',
    'home.hero.subtitle': 'We create extraordinary websites, winning SEO strategies and memorable brands that generate concrete results for your business.',
    'home.hero.cta1': 'Start Your Project',
    'home.hero.cta2': 'Discover How It Works',
    'home.stats.projects': 'Projects',
    'home.stats.clients': 'Clients',
    'home.stats.rating': 'Rating',

    'home.services.badge': '💼 Our Services',
    'home.services.title': 'Complete Solutions for Your Business',
    'home.services.subtitle': 'From website creation to online growth, we offer everything you need to dominate the digital market.',
    'home.services.web.title': 'Web Design & Development',
    'home.services.web.desc': 'Professional, responsive websites optimized for conversions',
    'home.services.web.price': 'from €1,080',
    'home.services.seo.title': 'SEO & Marketing',
    'home.services.seo.desc': 'Advanced SEO strategies to dominate search results',
    'home.services.seo.price': 'from €270/month',
    'home.services.branding.title': 'Branding & Graphics',
    'home.services.branding.desc': 'Memorable visual identities that distinguish your brand',
    'home.services.branding.price': 'from €360',
    'home.services.cta': 'Learn More',
    'home.services.viewAll': 'View All Services',

    'home.pricing.badge': '💰 Transparent Pricing',
    'home.pricing.title': 'No Surprises, Only Results',
    'home.pricing.subtitle': 'Clear and fixed prices for every project. You\'ll know exactly what you get and how much it costs.',
    'home.pricing.web.title': 'Professional Websites',
    'home.pricing.web.desc': 'From €1,080 to €6,500 - Fixed prices based on features and complexity',
    'home.pricing.seo.title': 'Monthly SEO Services',
    'home.pricing.seo.desc': 'From €270 to €1,040/month - Scalable plans for every budget',
    'home.pricing.note': 'All prices exclude VAT. Custom quotes available.',

    'home.why.badge': '⭐ Why Choose Us',
    'home.why.title': 'The Mixim Difference',
    'home.why.subtitle': 'We\'re not just another digital studio. We\'re your partners for online success.',
    'home.why.design.title': 'Design That Converts',
    'home.why.design.desc': 'Every pixel is designed to maximize conversions and results',
    'home.why.team.title': 'Expert Team',
    'home.why.team.desc': 'Professionals with years of experience in successful projects',
    'home.why.delivery.title': 'Fast Delivery',
    'home.why.delivery.desc': 'Respected delivery times and constant communication',

    'home.process.badge': '🔄 Our Process',
    'home.process.title': 'How We Work',
    'home.process.subtitle': 'A proven process that guarantees exceptional results for every project.',
    'home.process.discovery.title': 'Discovery',
    'home.process.discovery.desc': 'We analyze your goals and the market',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};