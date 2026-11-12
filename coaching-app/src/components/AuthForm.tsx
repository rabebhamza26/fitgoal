import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Mail, UserRoundPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { postJson, setAccessToken } from '../api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface AuthResponse {
  accessToken: string | null;
  role: 'CLIENT' | 'COACH' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL';
  message: string;
}

const largeBubbles = [
  { x: 10, delay: '0s', duration: '6.5s' },
  { x: 373, delay: '250ms', duration: '5.25s' },
  { x: 408, delay: '750ms', duration: '6s' },
  { x: 621, delay: '1.5s', duration: '5.5s' },
  { x: 179, delay: '4s', duration: '6.5s' },
];

const smallBubbles = [
  { x: 147, delay: '0s', duration: '5.25s' },
  { x: 255, delay: '0s', duration: '5.75s' },
  { x: 573, delay: '250ms', duration: '5.25s' },
  { x: 429, delay: '325ms', duration: '5.75s' },
  { x: 91, delay: '125ms', duration: '6s' },
  { x: 640, delay: '250ms', duration: '5.13s' },
  { x: 321, delay: '350ms', duration: '6.25s' },
  { x: 376, delay: '200ms', duration: '7s' },
  { x: 230, delay: '233ms', duration: '6.25s' },
  { x: 497, delay: '900ms', duration: '6s' },
];

const REMEMBERED_EMAIL_KEY = 'fitgoal.rememberedEmail';

function AuthForm({ mode }: AuthFormProps) {
  const isRegistration = mode === 'register';
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [accountType, setAccountType] = useState<'client' | 'coach'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [rememberedEmail] = useState(() => (
    typeof window === 'undefined' ? '' : window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''
  ));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      if (!isRegistration) {
        if (form.get('remember') === 'on') {
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }

      const response = isRegistration
        ? await postJson<AuthResponse>('/auth/register', {
            name: String(form.get('name') ?? ''),
            email,
            password,
            role: accountType.toUpperCase(),
          })
        : await postJson<AuthResponse>('/auth/login', { email, password });

      if (response.accessToken) {
        setAccessToken(response.accessToken);
        navigate(response.role === 'ADMIN' ? '/admin' : '/');
        return;
      }

      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`auth-page${isRegistration ? ' auth-page--register' : ' auth-page--login'}`}>
      <div className="auth-bubbles" aria-hidden="true">
        <svg className="auth-bubbles-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 701 1024" preserveAspectRatio="xMidYMax slice">
          <g className="auth-bubbles-large" strokeWidth="7">
            {largeBubbles.map(({ x, delay, duration }, index) => (
              <g key={index} style={{ animationDelay: delay, animationDuration: duration }}>
                <g transform={`translate(${x} 940)`}>
                  <circle cx="35" cy="35" r="35" />
                </g>
              </g>
            ))}
          </g>
          <g className="auth-bubbles-small" strokeWidth="4">
            {smallBubbles.map(({ x, delay, duration }, index) => (
              <g key={index} style={{ animationDelay: delay, animationDuration: duration }}>
                <g transform={`translate(${x} 984)`}>
                  <circle cx="15" cy="15" r="15" />
                </g>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <section className={`auth-card${isRegistration ? ' auth-card--register' : ' auth-card--login'}`} aria-labelledby="auth-title">
        <h1 id="auth-title">{isRegistration ? 'Créer un compte' : 'Content de vous revoir'}</h1>
        <p className="auth-description">
          {isRegistration
            ? 'Rejoignez Piste en tant que sportif ou en tant que coach.'
            : 'Connectez-vous à votre espace client, coach ou administrateur.'}
        </p>

        {isRegistration && (
          <div className="account-type" role="group" aria-label="Type de compte">
            <button
              className={accountType === 'client' ? 'account-type-option is-active' : 'account-type-option'}
              type="button"
              aria-pressed={accountType === 'client'}
              onClick={() => setAccountType('client')}
            >
              Je suis client
            </button>
            <button
              className={accountType === 'coach' ? 'account-type-option is-active' : 'account-type-option'}
              type="button"
              aria-pressed={accountType === 'coach'}
              onClick={() => setAccountType('coach')}
            >
              Je suis coach
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistration && <input type="hidden" name="accountType" value={accountType} />}
          {isRegistration && (
            <label>
              Nom complet
              <span className="auth-input-wrap">
                <UserRoundPlus size={17} />
                <input name="name" type="text" autoComplete="name" placeholder="Votre nom" required />
              </span>
            </label>
          )}
          <label>
            Adresse e-mail
            <span className="auth-input-wrap">
              <Mail size={17} />
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                defaultValue={isRegistration ? undefined : rememberedEmail}
                required
              />
            </span>
          </label>
          <label>
            Mot de passe
            <span className="auth-input-wrap">
              <KeyRound size={17} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegistration ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                minLength={isRegistration ? 8 : undefined}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {!isRegistration && (
            <div className="login-options">
              <label className="remember-me">
                <input name="remember" type="checkbox" defaultChecked={Boolean(rememberedEmail)} />
                <span>Mémoriser mon adresse e-mail</span>
              </label>
              <Link className="forgot-password" to="/mot-de-passe-oublie">
                Mot de passe oublié ?
              </Link>
            </div>
          )}
          <button className="button button--primary auth-submit" type="submit" disabled={isSubmitting}>
            {isRegistration ? 'Créer mon compte' : 'Se connecter'}
            {isSubmitting && '…'}
          </button>
          {message && <p className="auth-notice" role="status">{message}</p>}
        </form>

        <p className="auth-switch">
          {isRegistration ? 'Vous avez déjà un compte ?' : 'Vous n’avez pas encore de compte ?'}{' '}
          <Link to={isRegistration ? '/connexion' : '/inscription'}>
            {isRegistration ? 'Se connecter' : 'Créer un compte'}
          </Link>
        </p>
      </section>
    </main>
  );
}

export default AuthForm;
