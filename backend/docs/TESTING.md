# Tests — How to run and notes

Dieses Dokument beschreibt, wie du die Unit- und Integrationstests lokal ausführst und warum manche Tests Module‑Mocking verwenden.

1) Unit tests

- Wechsle ins Backend-Verzeichnis und führe die Unit-Tests aus:

```powershell
cd C:\Users\georr\devchat\backend
npm run test:unit
```

- Unit‑Tests sind isoliert: sie mocken Dateisystem, Redis/Cache und die TypeORM DataSource, sodass sie schnell und deterministisch laufen.

2) Integration tests

- Integrationstests nutzen eine in-memory SQLite DataSource und starten das Express‑App (ohne Produktionsdaten). Sie testen End‑to‑End‑Flows (HTTP + Socket.io).

```powershell
cd C:\Users\georr\devchat\backend
npm run test:integration
```

- Hinweise:
  - Die Tests setzen `NODE_ENV=test` und initialisieren vor dem Import der App eine Test‑DataSource (in `tests/integration/setupIntegration.ts`).
  - Redis ist optional; wenn kein Redis verfügbar ist, überspringt das Projekt die Blacklist/Cache‑Operationen (safe fallback).

3) Umgang mit Blacklist-Tests

- Einige Integrationstests müssen den Fall simulieren, dass ein Token auf der Blacklist liegt. Dafür verwenden die Tests reines `jest`-Module‑Mocking, z.B.:

  - `jest.resetModules()` und `jest.doMock('../../src/services/tokenBlacklist.service', ...)` vor dem Import der App.
  - Zusätzlich wird in einer isolierten Import‑Umgebung `jsonwebtoken.verify` kurz überschrieben, damit die Middleware die Token‑Payload akzeptiert (nur für den Test‑Import).

- Diese Mocking‑Strategie ist absichtlich testseitig, damit der Produktiv‑Code unverändert bleibt.

4) CI / Redis (optional)

- Wenn du den echten Blacklist‑Flow testen möchtest, kannst du in CI einen temporären Redis starten (z.B. als Service oder Docker‑Container) und die Tests gegen echten Redis laufen lassen.

5) Troubleshooting

- Offene Handles / Jest not exit: Stelle sicher, dass Tests HTTP-Server / Socket.io-Server sauber schließen (die Integrationstests im Repo machen das bereits in afterAll).
- Falls Tests JWT‑Fehler melden: prüfe, dass `.env.test` die gleiche `JWT_SECRET` enthält wie die Tests erwarten.

Wenn du möchtest, schreibe ich noch einen kurzen Abschnitt mit Beispiel‑Jenkins/GitHub Actions Steps, um die Integrationstests in CI mit Redis laufen zu lassen.
