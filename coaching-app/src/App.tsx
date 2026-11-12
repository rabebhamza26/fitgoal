import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  KeyRound,
  Menu,
  Smartphone,
  Star,
  TrendingUp,
  UserRoundPlus,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { getJson, postJson } from './api';
import heroImage from './assets/img1.png';
import introVideo from './assets/video.mp4';
import ConnexionPage from './pages/ConnexionPage';
import InscriptionPage from './pages/InscriptionPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import AdminDashboard from './pages/AdminDashboard';
import type { HomePageData, MessageResponse } from './types';
import './App.css';

const serviceIcons: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  nutrition: Utensils,
  application: Smartphone,
  progress: ChartNoAxesCombined,
};

function HomePage() {
  const [home, setHome] = useState<HomePageData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const coachTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    getJson<HomePageData>('/home')
      .then((data) => {
        if (isMounted) setHome(data);
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Le contenu ne peut pas être chargé. Vérifiez que le backend est démarré.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!home || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    const elements = document.querySelectorAll<HTMLElement>('.scroll-reveal, .scroll-reveal-item');
    const directions = ['up', 'down', 'left', 'right'] as const;

    elements.forEach((element, index) => {
      element.dataset.reveal = directions[index % directions.length];
      element.classList.add('reveal-pending');
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [home]);

  useEffect(() => {
    if (!isVideoOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVideoOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isVideoOpen]);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubscribing(true);
    setNewsletterMessage('');
    setNewsletterError('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('newsletterEmail') ?? '');
    const formElement = event.currentTarget;

    try {
      const response = await postJson<MessageResponse>('/leads/newsletter', { email });
      setNewsletterMessage(response.message);
      formElement.reset();
    } catch {
      setNewsletterError('Inscription impossible pour le moment. Réessayez plus tard.');
    } finally {
      setIsSubscribing(false);
    }
  }

  function moveCoaches(direction: -1 | 1) {
    const track = coachTrackRef.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;

    track.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
  }

  if (!home && loadError) {
    return (
      <main className="status-screen" role="alert">
        <h1>FitGoal</h1>
        <p>{loadError}</p>
        <button className="button button--primary" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="status-screen" aria-live="polite">
        <span className="spinner" />
        <p>Chargement de votre espace FitGoal…</p>
      </main>
    );
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#accueil" aria-label="FitGoal, accueil">
            <span className="brand-mark"><Dumbbell size={23} strokeWidth={2.5} /></span>
            <span className="brand-copy">
              <span className="brand-name">FIT<span>GOAL</span></span>
            </span>
          </a>

          <nav className={`nav${menuOpen ? ' nav--open' : ''}`} aria-label="Navigation principale">
            <a className="nav-link" href="#accueil" onClick={() => setMenuOpen(false)}>Accueil</a>
            <a className="nav-link" href="#concept" onClick={() => setMenuOpen(false)}>Concept &amp; Services</a>
            <a className="nav-link" href="#coachs" onClick={() => setMenuOpen(false)}>Nos coachs</a>
            <a className="nav-link" href="#avis" onClick={() => setMenuOpen(false)}>Avis</a>
            <a className="nav-link" href="#tarifs" onClick={() => setMenuOpen(false)}>Tarifs</a>
          </nav>

          <div className="header-actions">
            <Link className="button button--member" to="/connexion">
              <KeyRound size={15} /> Connexion
            </Link>
            <Link className="button button--primary" to="/inscription">
              <UserRoundPlus size={15} /> Inscription
            </Link>
            <button
              className="menu-toggle"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-snow" aria-hidden="true">
            <svg viewBox="0 0 1440 600" preserveAspectRatio="none">
              <g className="snow-layer snow-layer--slow">
                <g transform="translate(0 -600)">
                  <circle cx="72" cy="72" r="3" /><circle cx="196" cy="315" r="2" />
                  <circle cx="342" cy="168" r="2.5" /><circle cx="488" cy="462" r="3" />
                  <circle cx="635" cy="90" r="2" /><circle cx="766" cy="275" r="3" />
                  <circle cx="914" cy="520" r="2.5" /><circle cx="1052" cy="197" r="2" />
                  <circle cx="1198" cy="385" r="3" /><circle cx="1362" cy="118" r="2.5" />
                </g>
                <g>
                  <circle cx="72" cy="72" r="3" /><circle cx="196" cy="315" r="2" />
                  <circle cx="342" cy="168" r="2.5" /><circle cx="488" cy="462" r="3" />
                  <circle cx="635" cy="90" r="2" /><circle cx="766" cy="275" r="3" />
                  <circle cx="914" cy="520" r="2.5" /><circle cx="1052" cy="197" r="2" />
                  <circle cx="1198" cy="385" r="3" /><circle cx="1362" cy="118" r="2.5" />
                </g>
              </g>
              <g className="snow-layer snow-layer--fast">
                <g transform="translate(0 -600)">
                  <circle cx="135" cy="225" r="4" /><circle cx="285" cy="525" r="3.5" />
                  <circle cx="452" cy="28" r="3" /><circle cx="584" cy="352" r="4" />
                  <circle cx="724" cy="155" r="3.5" /><circle cx="872" cy="430" r="3" />
                  <circle cx="1007" cy="63" r="4" /><circle cx="1142" cy="290" r="3.5" />
                  <circle cx="1300" cy="495" r="4" />
                </g>
                <g>
                  <circle cx="135" cy="225" r="4" /><circle cx="285" cy="525" r="3.5" />
                  <circle cx="452" cy="28" r="3" /><circle cx="584" cy="352" r="4" />
                  <circle cx="724" cy="155" r="3.5" /><circle cx="872" cy="430" r="3" />
                  <circle cx="1007" cy="63" r="4" /><circle cx="1142" cy="290" r="3.5" />
                  <circle cx="1300" cy="495" r="4" />
                </g>
              </g>
            </svg>
          </div>
          <div className="container hero-inner">
            <div className="hero-copy scroll-reveal">
              <span className="hero-badge"><Award size={14} /> {home.hero.badge}</span>
              <h1>{home.hero.title} <span>{home.hero.highlight}</span></h1>
              <p className="hero-description">{home.hero.description}</p>
              <div className="hero-actions">
                <button className="button button--primary" >
                  <Link  to="/connexion">
              <KeyRound size={18} /> se connecter
            </Link>
                </button>
             
               
              </div>
              <div className="hero-proof">
                <div><strong>+{home.stats.members}</strong><span>Membres actifs</span></div>
                <div><strong>{home.stats.averageRating.toFixed(1)} / 5</strong><span>Note des clients</span></div>
                <div><strong>100%</strong><span>Sur-mesure</span></div>
              </div>
            </div>
            <div className="hero-visual scroll-reveal">
              <div className="hero-photo">
                <img src={heroImage} alt="Un coach FitGoal accompagne un membre pendant son entraînement en salle" />
              </div>
            </div>
          </div>
        </section>

        <section className="intro-video" aria-label="Présentation vidéo de FitGoal">
          <div className="container intro-video-content scroll-reveal">
            <h2 className="intro-video-title">Regardez la vidéo</h2>
            <button
              className="intro-video-play"
              type="button"
              aria-label="Lire la vidéo de présentation FitGoal"
              onClick={() => setIsVideoOpen(true)}
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </section>

        {isVideoOpen && (
          <div
            className="intro-video-modal"
            role="presentation"
            onClick={() => setIsVideoOpen(false)}
          >
            <div
              className="intro-video-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Vidéo de présentation FitGoal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="intro-video-close"
                type="button"
                aria-label="Fermer la vidéo"
                onClick={() => setIsVideoOpen(false)}
              >
                <X size={24} />
              </button>
              <video autoPlay controls playsInline preload="metadata" aria-label="Vidéo de présentation FitGoal">
                <source src={introVideo} type="video/mp4" />
                Votre navigateur ne prend pas en charge la lecture vidéo.
              </video>
            </div>
          </div>
        )}

        <section className="section section--soft" id="concept">
          <div className="container">
            <div className="section-heading scroll-reveal">
              <span className="eyebrow">Pourquoi choisir FitGoal</span>
              <h2>Un écosystème complet pour transformer votre corps</h2>
              <p>Nous combinons expertise humaine et outils modernes pour vous garantir des progrès continus.</p>
            </div>
            <div className="service-grid">
              {home.services.map((service) => {
                const Icon = serviceIcons[service.icon] ?? TrendingUp;
                return (
                  <article className="service-card scroll-reveal-item" key={service.id}>
                    <span className="service-icon"><Icon size={28} strokeWidth={2.5} /></span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" id="coachs">
          <div className="container">
            <div className="section-heading scroll-reveal">
              <span className="eyebrow">Équipe d’experts</span>
              <h2>Nos coachs diplômés d’État</h2>
              <p>Des spécialistes dévoués à votre réussite physique et mentale.</p>
            </div>
            <div className="coach-carousel">
              <button className="carousel-button" aria-label="Voir les coachs précédents" onClick={() => moveCoaches(-1)}>
                <ChevronLeft size={20} />
              </button>
              <div className="coach-track" ref={coachTrackRef} aria-label="Liste des coachs">
                {home.coaches.map((coach) => (
                  <article className="coach-card scroll-reveal-item" key={coach.id}>
                    <div className="coach-photo">
                      <img src={coach.photoUrl} alt={`Coach ${coach.name}`} loading="lazy" />
                      <span className="coach-rating"><Star size={12} fill="currentColor" /> {coach.rating.toFixed(1)}</span>
                    </div>
                    <div className="coach-details">
                      <h3>{coach.name}</h3>
                      <div className="coach-specialty">{coach.specialty}</div>
                      <p>{coach.description}</p>
                      <div className="coach-credentials">
                        <span>Diplômes &amp; certifications</span>
                        <ul>
                          {coach.diplomas.map((diploma) => (
                            <li key={diploma}><BadgeCheck size={12} /> {diploma}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <button className="carousel-button" aria-label="Voir les coachs suivants" onClick={() => moveCoaches(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>        

        <section className="section section--dark" id="avis">
          <div className="container">
            <div className="section-heading scroll-reveal">
              <span className="eyebrow">Résultats vérifiés</span>
              <h2>Transformations &amp; avis de nos membres</h2>
              <p>Chaque parcours est unique. Découvrez comment nous avons aidé plus de {home.stats.members} membres à se dépasser.</p>
            </div>
            <div className="results-stats scroll-reveal">
              <div><strong>+{home.stats.members} clients</strong><span>Accompagnés avec succès</span></div>
              <div><strong>{home.stats.averageRating.toFixed(1)} / 5.0</strong><span>Note moyenne Google &amp; Trustpilot ⭐</span></div>
              <div><strong>{home.stats.satisfaction}%</strong><span>De satisfaction et maintien des résultats</span></div>
            </div>
            <div className="testimonial-grid">
              {home.testimonials.map((testimonial) => (
                <article className="testimonial-card scroll-reveal-item" key={testimonial.id}>
                  <div className="testimonial-photo">
                    <img src={testimonial.photoUrl} alt="Séance d’entraînement FitGoal" loading="lazy" />
                    <span className="testimonial-result">{testimonial.result}</span>
                  </div>
                  <div className="stars" aria-label="5 étoiles">
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill="currentColor" />)}
                  </div>
                  <p className="testimonial-quote">« {testimonial.quote} »</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.age} ans — Membre FitGoal</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--soft" id="tarifs">
          <div className="container">
            <div className="section-heading scroll-reveal">
              <span className="eyebrow">Transparence &amp; sans engagement</span>
              <h2>Des formules adaptées à tous vos besoins</h2>
              <p>Choisissez le niveau d’accompagnement qui correspond le mieux à votre rythme et vos ambitions.</p>
            </div>
            <div className="pricing-grid">
              {home.plans.map((plan) => (
                <article className={`plan-card scroll-reveal-item${plan.highlighted ? ' plan-card--featured' : ''}`} key={plan.id}>
                  {plan.highlighted && <span className="plan-ribbon">Le plus populaire</span>}
                  <h3>{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <p className="plan-price">{plan.priceMonthly}€<small> / mois</small></p>
                  <ul className="plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}><CheckCircle2 size={14} /> {feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--dark how-it-works" id="comment-ca-marche">
          <div className="container">
            <h2 className="how-it-works-title scroll-reveal">Comment ça marche</h2>
            <ol className="steps-grid">
              <li className="step-card scroll-reveal-item">
                <span className="step-number">01</span>
                <h3>Trouvez votre coach</h3>
                <p>Parcourez les profils par discipline, disponibilité et tarif, et choisissez celui qui correspond à vos objectifs.</p>
              </li>
              <li className="step-card scroll-reveal-item">
                <span className="step-number">02</span>
                <h3>Recevez votre programme</h3>
                <p>Votre coach construit un plan d’entraînement adapté à votre niveau, avec l’appui de suggestions générées par l’IA.</p>
              </li>
              <li className="step-card scroll-reveal-item">
                <span className="step-number">03</span>
                <h3>Suivez votre progression</h3>
                <p>Visualisez vos performances, échangez avec votre coach, et ajustez le plan au fil des semaines.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="signup-cta" aria-labelledby="signup-cta-title">
          <div className="container">
            <div className="signup-cta-panel scroll-reveal">
              <h2 id="signup-cta-title">Prêt à commencer votre transformation&nbsp;?</h2>
              <Link className="button button--primary" to="/inscription">
                Créer un compte gratuitement
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="scroll-reveal-item">
              <a className="brand" href="#accueil" aria-label="FitGoal, accueil">
                <span className="brand-mark"><Dumbbell size={21} /></span>
                <span className="brand-copy">
                  <span className="brand-name">FIT<span>GOAL</span></span>
                </span>
              </a>
              <p className="footer-description">Votre partenaire coaching personnalisé d’excellence. Atteignez vos objectifs avec des programmes sur mesure et un accompagnement humain disponible 7j/7.</p>
              <div className="social-links">
                <a href="https://www.instagram.com/" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-column scroll-reveal-item">
              <h3>Navigation</h3>
              <a href="#accueil">Accueil</a>
              <a href="#concept">Services &amp; concept</a>
              <a href="#coachs">Nos coachs</a>
              <a href="#tarifs">Formules &amp; tarifs</a>
              <a href="#avis">Témoignages clients</a>
            </div>
            <div className="footer-column scroll-reveal-item">
              <h3>Légal &amp; infos</h3>
              <a href="#mentions">Mentions légales</a>
              <a href="#cgu">CGU / CGV</a>
              <a href="#confidentialite">Politique de confidentialité</a>
              <a href="#cookies">Gestion des cookies</a>
            </div>
            <div className="footer-column scroll-reveal-item">
              <h3>Newsletter fitness</h3>
              <p className="footer-description">Recevez nos conseils nutrition &amp; entraînement chaque semaine.</p>
              <form className="newsletter-form" onSubmit={subscribe}>
                <label className="visually-hidden" htmlFor="newsletter-email">Votre adresse e-mail</label>
                <input id="newsletter-email" name="newsletterEmail" type="email" placeholder="Votre adresse email" required />
                <button className="button button--primary" type="submit" disabled={isSubscribing}>
                  {isSubscribing ? 'Envoi…' : 'S’abonner'}
                </button>
              </form>
              <p className={`form-message${newsletterError ? ' form-message--error' : ''}`} role="status">
                {newsletterError || newsletterMessage}
              </p>
            </div>
          </div>
          <div className="footer-bottom scroll-reveal">
            <span>© {new Date().getFullYear()} FitGoal. Tous droits réservés.</span>
            <span>Fait avec passion pour votre réussite physique.</span>
          </div>
        </div>
      </footer>

    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/mot-de-passe-oublie" element={<PasswordRecoveryPage />} />
        <Route path="/reset-password" element={<PasswordRecoveryPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
