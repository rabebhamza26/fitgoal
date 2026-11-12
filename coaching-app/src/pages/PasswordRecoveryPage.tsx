import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postJson } from '../api';

interface MessageResponse {
  message: string;
}

function PasswordRecoveryPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = token
        ? await postJson<MessageResponse>('/auth/reset-password', {
            token,
            password: String(form.get('password') ?? ''),
          })
        : await postJson<MessageResponse>('/auth/forgot-password', {
            email: String(form.get('email') ?? ''),
          });
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <section className="auth-card auth-card--login" aria-labelledby="recovery-title">
        <h1 id="recovery-title">
          {token ? 'Nouveau mot de passe' : 'Mot de passe oublié ?'}
        </h1>
        <p className="auth-description">
          {token
            ? 'Choisissez un nouveau mot de passe sécurisé pour votre compte.'
            : 'Saisissez votre adresse e-mail. Si un compte existe, vous recevrez un lien de réinitialisation.'}
        </p>

        {message ? (
          <div className="auth-recovery-result" role="status">
            <p>{message}</p>
            {token && <Link to="/connexion">Retour à la connexion</Link>}
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {token ? (
              <label>
                Nouveau mot de passe
                <span className="auth-input-wrap">
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="8 caractères minimum"
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </span>
              </label>
            ) : (
              <label>
                Adresse e-mail
                <span className="auth-input-wrap">
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    maxLength={254}
                    required
                  />
                </span>
              </label>
            )}
            <button className="button button--primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi…' : token ? 'Modifier le mot de passe' : 'Envoyer le lien'}
            </button>
            {error && <p className="auth-notice" role="alert">{error}</p>}
          </form>
        )}

        {!token && (
          <p className="auth-switch">
            <Link to="/connexion">Retour à la connexion</Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default PasswordRecoveryPage;
