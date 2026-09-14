# GTA 5 Karte

Interaktive Karte für eure Discord-Community: Wegpunkte mit Titel, Beschreibung und farbigen Kategorien setzen, per Leaflet-Tile-Pyramide dargestellt. Login über Discord OAuth, Bearbeiten nur für eine konfigurierte Admin-Rolle.

## 1. Discord-App einrichten

1. Auf https://discord.com/developers/applications eine neue Application anlegen.
2. **OAuth2** → Redirect URL hinzufügen: `http://localhost:3000/auth/discord/callback` (in Produktion eure echte Domain). Client-ID/Secret notieren.
3. **Bot** → Bot anlegen, Token notieren, **keine** privilegierten Intents nötig. Den Bot auf euren Server einladen (OAuth2 URL Generator, Scope `bot`, Permission reicht "View Channels"/keine, da er nur Guild-Mitglieder abfragt).
4. Eure Guild-ID (Rechtsklick auf Server-Icon → "ID kopieren", Entwicklermodus muss an sein) und die Rollen-ID(s) notieren, die Markierungen bearbeiten dürfen dürfen.

## 2. Konfiguration

```
cp .env.example .env
```
Alle Werte aus Schritt 1 eintragen, plus ein zufälliges `SESSION_SECRET` (z. B. `openssl rand -hex 32`).

## 3. Kartenbild → Tiles generieren

Rockstars Kartenmaterial ist urheberrechtlich geschützt und nicht Teil dieses Repos — besorgt euch selbst ein hochauflösendes GTA-5-Kartenbild (PNG/JPG) und generiert daraus die Tile-Pyramide:

```
npm install
npm run tiles -- --input /pfad/zu/eurer-map.png --output ./server/tiles
```

Das Skript gibt am Ende einen `MAX_ZOOM`-Wert aus — diesen in `client/src/config.ts` (`MAP_MAX_ZOOM`) eintragen.

## 4. Lokale Entwicklung

```
npm run dev:db       # Postgres in Docker
cd server && npx prisma migrate dev --name init
npm run dev:server   # :3000
npm run dev:client   # :5173 (Vite, proxied zu :3000)
```
Browser: http://localhost:5173

## 5. Produktion (Docker)

```
docker compose up --build
```
Führt beim Start automatisch `prisma migrate deploy` aus. App läuft unter http://localhost:3000 (API, Auth, Tiles und der gebaute Client aus einem Origin).

## Berechtigungen

- Karte ansehen: öffentlich, kein Login nötig.
- Markierungen/Kategorien erstellen, bearbeiten, löschen: nur eingeloggte Discord-User mit einer Rolle aus `ADMIN_ROLE_IDS` in `DISCORD_GUILD_ID`.
