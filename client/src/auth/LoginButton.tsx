import { useAuth } from "./AuthContext";

export function LoginButton() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (!user) {
    // Full navigation, not a fetch — this needs to leave the SPA for the Discord OAuth redirect.
    return (
      <a className="login-button" href="/auth/discord/login">
        Mit Discord anmelden
      </a>
    );
  }

  return (
    <div className="user-badge">
      {user.avatar && (
        <img
          src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`}
          alt=""
          width={24}
          height={24}
        />
      )}
      <span>{user.username}</span>
      {user.isAdmin && <span className="admin-pill">Admin</span>}
      <button type="button" onClick={() => void logout()}>
        Abmelden
      </button>
    </div>
  );
}
