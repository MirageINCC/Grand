# Deployment (Mittwald)

Diese Karte läuft produktiv auf Mittwald als Container-Stack im Projekt **"Grönd"** (`p-i0wsnq`),
auf dem Server "Covern / Development". Dieses Dokument beschreibt den aktuellen Aufbau, damit ein
Redeploy oder eine Fehlersuche nicht wieder bei null anfängt.

## Architektur

Zwei Container in einem Stack (kein `docker compose up --build` wie lokal — Mittwald-Stacks
referenzieren fertige Images, sie bauen nicht selbst):

- **`app`**: Image `ghcr.io/mirageincc/grand:latest`, gebaut von GitHub Actions
  (`.github/workflows/docker-publish.yml`) bei jedem Push auf `main`. Das GHCR-Package ist
  **public**, damit Mittwald es ohne Registry-Credentials pullen kann.
- **`postgres`**: `postgres:16-alpine`, mit einem persistenten Named Volume (`pgdata`).

Domain: **https://grand.covern.cloud** (Subdomain von `covern.cloud`, verwaltet über Mittwalds
eigene Nameserver). Eingerichtet über einen Virtualhost im Grönd-Projekt, der `/` auf den
`app`-Container, Port 3000, mappt. TLS-Zertifikat wird von Mittwald automatisch verwaltet.

## Secrets

Liegen **nur** als Environment-Variablen im Mittwald-Stack (`app`-Service), nicht im Repo:

| Variable | Quelle |
|---|---|
| `DATABASE_URL` | zeigt intern auf den `postgres`-Service im selben Stack |
| `SESSION_SECRET` | generiert (`openssl rand -hex 32`) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord Developer Portal → App → OAuth2 |
| `DISCORD_REDIRECT_URI` | fest `https://grand.covern.cloud/auth/discord/callback` |
| `DISCORD_BOT_TOKEN` | Discord Developer Portal → App → Bot |
| `DISCORD_GUILD_ID` | Discord-Server-ID (Rechtsklick auf Server-Icon → ID kopieren) |
| `ADMIN_ROLE_IDS` | s. Warnung unten |

**Wichtig — Stolperfalle bei `ADMIN_ROLE_IDS`:** Discord-Server haben oft eine automatisch
vergebene Rolle namens **"BOT"** (oder ähnlich) für Integrationen. Das ist **keine** Rolle, die ein
Mensch halten kann — wird sie versehentlich als Admin-Rolle eingetragen, wird nie jemand als Admin
erkannt. Zum Prüfen der tatsächlichen Rollen-IDs:

```
curl -s -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  "https://discord.com/api/v10/guilds/$DISCORD_GUILD_ID/roles" | jq '.[] | {id, name}'
```

`ADMIN_ROLE_IDS` muss eine Rolle sein, die eure menschlichen Moderator:innen tatsächlich im Server
haben (bei uns: die Rolle **"Mirage"**).

## Redeploy

Stack-Konfiguration ist deklarativ (docker-compose-Format) und wird per Mittwald-MCP-Tool
(`mittwald_stack_deploy`) oder über das mStudio-Webinterface aktualisiert. Nach einer reinen
Env-Var-Änderung (z. B. neue `ADMIN_ROLE_IDS`) reicht ein Neustart des `app`-Containers, da
Environment-Variablen nur beim Prozessstart gelesen werden (`server/src/env.ts`).

Bei einem neuen Image (nach Code-Änderungen): einfach auf `main` pushen — der GitHub-Actions-
Workflow baut und pusht automatisch ein neues `:latest`. Den Mittwald-Stack danach neu deployen
(gleiche Compose-Datei reicht, das Image wird per Tag neu gepullt) oder den Container manuell
neu starten, damit das neue Image gezogen wird.

## Bekannte Stolperfallen

- **GHCR-Image-Namen müssen komplett kleingeschrieben sein.** `github.repository` (z. B.
  `MirageINCC/Grand`) behält die tatsächliche Groß-/Kleinschreibung des Repos bei — das lässt den
  `docker/build-push-action`-Schritt fehlschlagen. Der Workflow rechnet das explizit klein
  (`${GITHUB_REPOSITORY,,}`), siehe `.github/workflows/docker-publish.yml`.
- **Domain-Virtualhost per MCP-Tool war zum Zeitpunkt dieses Deployments kaputt**
  (`mittwald_domain_virtualhost_create` gab unabhängig vom übergebenen Pfad-Parameter immer
  `paths is required` zurück). Workaround: Virtualhost über das mStudio-Webinterface anlegen
  (Projekt → Domains → Domain hinzufügen → Ziel: App-Container, Port 3000).
- Beim allerersten Start eines frischen Stacks versucht der `app`-Container ggf. einmal
  `prisma migrate deploy`, bevor Postgres bereit ist (`P1001`). Das ist unkritisch — die
  `restartPolicy: on-failure` des Containers fängt das automatisch mit einem Neuversuch ab.

## Verifikations-Checkliste (nach jedem Redeploy)

```
curl -sI https://grand.covern.cloud/                  # 200, gültiges TLS
curl -s  https://grand.covern.cloud/api/categories     # [] statt 500
curl -s  https://grand.covern.cloud/api/markers        # [] statt 500
curl -s  https://grand.covern.cloud/auth/me            # {"user":null} ohne Cookie
```

Danach im Browser einloggen (`/auth/discord/login`) und prüfen, ob das Admin-Badge erscheint.

## Offen / nicht Teil dieses Deployments

- **Kartenbild/Tiles**: `server/tiles/` ist auf dem Server aktuell leer — die Karte zeigt eine
  weiße Fläche. Sobald ein Kartenbild vorliegt: `npm run tiles -- --input <bild> --output
  ./server/tiles` lokal ausführen, Tiles auf den Server bringen (z. B. per SCP in ein
  persistentes Volume, das in den `app`-Container gemountet wird) und `MAP_MAX_ZOOM` in
  `client/src/config.ts` auf den vom Skript ausgegebenen Wert setzen.
- Backups/Cronjobs für die Postgres-DB sind noch nicht eingerichtet.
