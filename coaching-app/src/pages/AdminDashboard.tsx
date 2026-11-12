import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Shield,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAccessToken, getJson, patchJson } from '../api';
import './AdminDashboard.css';

type AdminTab =
  | 'overview'
  | 'users'
  | 'moderation'
  | 'subscriptions'
  | 'analytics'
  | 'ai'
  | 'permissions';

interface AdminAccount {
  role: string;
  status: string;
  permissions: string[];
  name: string;
  email: string;
}

interface PendingCoach {
  id: number;
  name: string;
  email: string;
}

interface MessageResponse {
  message: string;
}

interface TabDefinition {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
}

const tabs: TabDefinition[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'moderation', label: 'Modération', icon: MessageSquareWarning },
  { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { id: 'analytics', label: 'Statistiques', icon: Activity },
  { id: 'ai', label: 'Configuration IA', icon: Bot },
  { id: 'permissions', label: 'Rôles et droits', icon: Shield },
];

const permissionLabels: Record<string, string> = {
  USERS_MANAGE: 'Gestion des utilisateurs',
  COACHES_APPROVE: 'Approbation des coachs',
  LEADS_READ: 'Consultation des demandes',
  PLANS_MANAGE: 'Gestion des forfaits',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [pendingCoaches, setPendingCoaches] = useState<PendingCoach[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [busyCoachId, setBusyCoachId] = useState<number | null>(null);
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!window.sessionStorage.getItem('fitgoal.accessToken')) {
        navigate('/connexion', { replace: true });
        return;
      }

      try {
        const currentAccount = await getJson<AdminAccount>('/auth/me');
        if (currentAccount.role !== 'ADMIN') {
          navigate('/', { replace: true });
          return;
        }

        const coaches = await getJson<PendingCoach[]>('/admin/coaches/pending');
        if (isMounted) {
          setAccount(currentAccount);
          setPendingCoaches(coaches);
          setPageError('');
        }
      } catch (error) {
        if (!isMounted) return;
        if (!window.sessionStorage.getItem('fitgoal.accessToken')) {
          navigate('/connexion', { replace: true });
          return;
        }
        setPageError(error instanceof Error ? error.message : 'Le tableau de bord est indisponible.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  async function approveCoach(coach: PendingCoach) {
    setBusyCoachId(coach.id);
    setActionMessage('');
    setPageError('');

    try {
      const response = await patchJson<MessageResponse>(`/admin/coaches/${coach.id}/approve`);
      setPendingCoaches((current) => current.filter((item) => item.id !== coach.id));
      setActionMessage(response.message);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'L’approbation du coach a échoué.');
    } finally {
      setBusyCoachId(null);
    }
  }

  function signOut() {
    clearAccessToken();
    navigate('/connexion', { replace: true });
  }

  const title = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Vue d’ensemble';

  if (isLoading) {
    return (
      <main className="admin-loading" aria-live="polite">
        <span className="admin-spinner" />
        <p>Chargement de l’espace administrateur…</p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="admin-loading" role="alert">
        <AlertTriangle size={28} />
        <h1>Tableau de bord indisponible</h1>
        <p>{pageError || 'Impossible de vérifier les droits de cet utilisateur.'}</p>
        <Link className="admin-primary-link" to="/">Retour à l’accueil</Link>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      {isSidebarOpen && (
        <button
          className="admin-sidebar-scrim"
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar${isSidebarOpen ? ' is-open' : ''}`}>
        <Link className="admin-brand" to="/" aria-label="FitGoal, accueil">
          <span className="admin-brand-mark"><Dumbbell size={21} /></span>
          <span>FIT<span>GOAL</span></span>
        </Link>

        <div className="admin-sidebar-label">Administration</div>
        <nav className="admin-nav" aria-label="Navigation administrateur">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              className={`admin-nav-link${activeTab === id ? ' is-active' : ''}`}
              type="button"
              key={id}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => {
                setActiveTab(id);
                setIsSidebarOpen(false);
                setActionMessage('');
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'users' && pendingCoaches.length > 0 && (
                <span className="admin-nav-count">{pendingCoaches.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <span className="admin-avatar">{account.name.slice(0, 1).toUpperCase()}</span>
            <span className="admin-profile-copy">
              <strong>{account.name}</strong>
              <small>Administrateur</small>
            </span>
          </div>
          <button className="admin-signout" type="button" onClick={signOut}>
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-toggle"
            type="button"
            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div>
            <span className="admin-overline">Espace administrateur</span>
            <h1>{title}</h1>
          </div>
          <Link className="admin-site-link" to="/">Voir le site</Link>
        </header>

        <div className="admin-content">
          {pageError && (
            <div className="admin-alert admin-alert--error" role="alert">
              <AlertTriangle size={18} /> {pageError}
            </div>
          )}
          {actionMessage && (
            <div className="admin-alert admin-alert--success" role="status">
              <Check size={18} /> {actionMessage}
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewPanel
              pendingCoaches={pendingCoaches}
              onApprove={approveCoach}
              busyCoachId={busyCoachId}
              onOpenUsers={() => setActiveTab('users')}
            />
          )}
          {activeTab === 'users' && (
            <UsersPanel
              pendingCoaches={pendingCoaches}
              onApprove={approveCoach}
              busyCoachId={busyCoachId}
            />
          )}
          {activeTab === 'moderation' && <UnavailablePanel icon={MessageSquareWarning} title="Modération des contenus" />}
          {activeTab === 'subscriptions' && <UnavailablePanel icon={CircleDollarSign} title="Abonnements et facturation" />}
          {activeTab === 'analytics' && <UnavailablePanel icon={Activity} title="Statistiques de la plateforme" />}
          {activeTab === 'ai' && <UnavailablePanel icon={Bot} title="Configuration du module IA" />}
          {activeTab === 'permissions' && <PermissionsPanel account={account} />}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({
  pendingCoaches,
  onApprove,
  busyCoachId,
  onOpenUsers,
}: {
  pendingCoaches: PendingCoach[];
  onApprove: (coach: PendingCoach) => void;
  busyCoachId: number | null;
  onOpenUsers: () => void;
}) {
  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-overline">Supervision FitGoal</span>
          <h2>Vue globale de la plateforme</h2>
          <p>Retrouvez ici les validations disponibles et l’état des modules d’administration.</p>
        </div>
        <span className="admin-welcome-icon"><ShieldCheck size={27} /></span>
      </section>

      <section className="admin-stat-grid" aria-label="Indicateurs disponibles">
        <StatCard
          icon={Users}
          label="Coachs à approuver"
          value={String(pendingCoaches.length)}
          detail="Donnée en temps réel"
          available
        />
        <StatCard icon={CircleDollarSign} label="Revenus" value="—" detail="API de facturation requise" />
        <StatCard icon={Activity} label="Activité globale" value="—" detail="API de statistiques requise" />
        <StatCard icon={MessageSquareWarning} label="Contenus signalés" value="—" detail="API de modération requise" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-overline">Action disponible</span>
            <h2>Validation des coachs</h2>
          </div>
          <button className="admin-text-button" type="button" onClick={onOpenUsers}>
            Tous les utilisateurs <ChevronRight size={16} />
          </button>
        </div>
        <CoachTable coaches={pendingCoaches} onApprove={onApprove} busyCoachId={busyCoachId} />
      </section>

      <p className="admin-data-note">
        Les chiffres non disponibles ne sont pas estimés : leurs modules de données doivent être implémentés côté serveur.
      </p>
    </>
  );
}

function UsersPanel({
  pendingCoaches,
  onApprove,
  busyCoachId,
}: {
  pendingCoaches: PendingCoach[];
  onApprove: (coach: PendingCoach) => void;
  busyCoachId: number | null;
}) {
  return (
    <>
      <section className="admin-page-intro">
        <span className="admin-overline">Comptes et accès</span>
        <h2>Gestion des utilisateurs</h2>
        <p>La validation des nouveaux coachs est disponible. La liste globale et les actions de suspension/suppression nécessitent des API dédiées.</p>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Coachs en attente</h2>
            <p>{pendingCoaches.length} compte{pendingCoaches.length === 1 ? '' : 's'} à examiner</p>
          </div>
          <span className="admin-live-badge"><span /> Synchronisé avec le serveur</span>
        </div>
        <CoachTable coaches={pendingCoaches} onApprove={onApprove} busyCoachId={busyCoachId} />
      </section>
      <UnavailableNotice>
        Les comptes actifs, la suspension et la suppression ne sont pas exposés par le backend actuel.
      </UnavailableNotice>
    </>
  );
}

function CoachTable({
  coaches,
  onApprove,
  busyCoachId,
}: {
  coaches: PendingCoach[];
  onApprove: (coach: PendingCoach) => void;
  busyCoachId: number | null;
}) {
  if (coaches.length === 0) {
    return (
      <div className="admin-empty-state">
        <ClipboardCheck size={26} />
        <strong>Aucun coach en attente</strong>
        <span>Les nouvelles demandes apparaîtront ici.</span>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr><th>Coach</th><th>Adresse e-mail</th><th>Statut</th><th><span className="visually-hidden">Action</span></th></tr>
        </thead>
        <tbody>
          {coaches.map((coach) => (
            <tr key={coach.id}>
              <td>
                <span className="admin-table-person">
                  <span className="admin-table-avatar">{coach.name.slice(0, 1).toUpperCase()}</span>
                  <strong>{coach.name}</strong>
                </span>
              </td>
              <td>{coach.email}</td>
              <td><span className="admin-status-pending">En attente</span></td>
              <td className="admin-table-action">
                <button
                  className="admin-approve-button"
                  type="button"
                  disabled={busyCoachId === coach.id}
                  onClick={() => onApprove(coach)}
                >
                  <Check size={15} /> {busyCoachId === coach.id ? 'Validation…' : 'Approuver'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  available = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  available?: boolean;
}) {
  return (
    <article className={`admin-stat-card${available ? ' is-available' : ''}`}>
      <span className="admin-stat-icon"><Icon size={19} /></span>
      <span className="admin-stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function UnavailablePanel({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <>
      <section className="admin-page-intro">
        <span className="admin-overline">Administration</span>
        <h2>{title}</h2>
        <p>Ce module est prévu dans l’espace administrateur et s’activera lorsque son API sera disponible.</p>
      </section>
      <UnavailableNotice>
        Aucune donnée fictive n’est affichée. Les routes et la persistance de ce module ne sont pas encore implémentées côté backend.
      </UnavailableNotice>
      <section className="admin-feature-placeholder">
        <span className="admin-feature-icon"><Icon size={25} /></span>
        <h3>Module en attente de son API</h3>
        <p>Les données et les actions de ce panneau ne sont pas encore disponibles.</p>
      </section>
    </>
  );
}

function PermissionsPanel({ account }: { account: AdminAccount }) {
  return (
    <>
      <section className="admin-page-intro">
        <span className="admin-overline">Sécurité</span>
        <h2>Rôles et droits</h2>
        <p>Permissions réellement associées à votre compte administrateur selon le backend.</p>
      </section>
      <section className="admin-panel admin-permissions-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Votre profil</h2>
            <p>{account.email}</p>
          </div>
          <span className="admin-role-badge"><ShieldCheck size={15} /> {account.role}</span>
        </div>
        <div className="admin-permission-list">
          {account.permissions.map((permission) => (
            <div className="admin-permission-row" key={permission}>
              <span className="admin-permission-check"><Check size={15} /></span>
              <span>{permissionLabels[permission] ?? permission.replace(/_/g, ' ')}</span>
              <code>{permission}</code>
            </div>
          ))}
          {account.permissions.length === 0 && (
            <div className="admin-inline-empty">Aucune permission n’est retournée pour ce compte.</div>
          )}
        </div>
      </section>
      <UnavailableNotice>
        L’attribution et la modification des permissions par profil nécessitent une API d’administration dédiée.
      </UnavailableNotice>
    </>
  );
}

function UnavailableNotice({ children }: { children: string }) {
  return (
    <div className="admin-unavailable-notice">
      <AlertTriangle size={18} />
      <p>{children}</p>
    </div>
  );
}

export default AdminDashboard;
