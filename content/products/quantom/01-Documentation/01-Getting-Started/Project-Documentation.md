# QuantomDocs - Admin-Enhanced Documentation Website

QuantomDocs ist eine moderne, statische Dokumentationswebsite mit vollständigem Admin-Management-System für das Quantom Minecraft Server Software Projekt.

## 🚀 Features

### 🔐 **Sicheres Login-System**
- **Benutzer-Authentifizierung** mit bcrypt-Password-Hashing
- **JWT-Token basierte Sessions** mit 24h Gültigkeit
- **Rate Limiting** gegen Brute-Force-Attacken
- **Login-Status Anzeige** im Header und Mobile Menu

### 📥 **Downloads-Management**
- **Admin-Interface** für Projekt- und Download-Verwaltung
- **Zwei Modi**: Neue Projekte erstellen oder Downloads zu bestehenden Projekten hinzufügen
- **File & Link Upload** Support mit automatischer Speicherung
- **Kategorie-System** für organisierte Projektstruktur
- **Changelog-Management** mit vereinfachter Struktur (nur Nachrichten)
- **Projekt bearbeiten/löschen** mit Bestätigungsdialogen

### 📝 **Blog-System**
- **Admin-Interface** für Artikel-Erstellung
- **Rich Content Editor** mit Titel, Untertitel, Beschreibung, Tags
- **Bild-Upload** für Artikel-Header (automatische Speicherung in `images/blogs/`)
- **Sektionen-System** für strukturierte Artikel
- **Automatische Lesezeit-Berechnung**
- **Artikel löschen/bearbeiten** (Bearbeiten in Entwicklung)

### 🖥️ **Backend (Node.js/Express)**
- **Port 3090** für alle API-Endpunkte
- **Sichere Datei-Uploads** mit Multer (10MB Limit)
- **CORS-Support** für Frontend-Integration
- **Health-Check Endpoint** für Status-Monitoring
- **Umfassende Fehlerbehandlung** und Logging

### 🌐 **Server-Status Integration**
- **Automatische Verbindungsüberwachung** alle 30 Sekunden
- **Offline-Weiterleitung** zu index.html bei Server-Ausfall
- **Status-Warnung** auf der Startseite bei Backend-Problemen
- **Graceful Degradation** für bessere User Experience

### 📱 **Responsive Design**
- **Mobile-optimiert** für alle Admin-Funktionen
- **Touch-friendly** Buttons und Formulare
- **Adaptive Layouts** für verschiedene Bildschirmgrößen
- **Einheitliches Design-System** mit CSS-Variablen

## 🛠️ Installation & Setup

### Voraussetzungen
- **Node.js** (v16 oder höher)
- **npm** Package Manager

### 1. Dependencies installieren
```bash
npm install
```

### 2. Benutzer-Datenbank initialisieren
```bash
node hash_password.js
```
Dies erstellt `config/users.json` mit dem Standard-Admin-Account:
- **Username**: `admin`
- **Password**: `Fring779!`

### 3. Backend-Server starten
```bash
npm start
# oder für Entwicklung:
npm run dev
```

Server läuft auf: `http://localhost:3090`

### 4. Website öffnen
Öffne `index.html` in einem Browser oder verwende einen lokalen Webserver.

## 📁 Projektstruktur

```
QuantomDocs/
├── 📄 server.js              # Express Backend Server
├── 📄 hash_password.js       # Benutzer-Setup Script
├── 📄 package.json          # Node.js Dependencies
├── 📄 login.html            # Admin Login-Seite
├── 📄 index.html            # Startseite
├── 📄 downloads.html        # Downloads mit Admin-Interface
├── 📄 blog.html             # Blog mit Admin-Interface
├── 📄 docs.html             # Dokumentation
├── 📁 config/
│   ├── 📄 users.json        # Benutzer-Datenbank (gehashte Passwörter)
│   ├── 📄 downloads.json    # Downloads & Projekte
│   ├── 📄 blog.json        # Blog-Artikel
│   └── 📄 docs-config.json # Dokumentations-Navigation
├── 📁 css/
│   ├── 📄 common.css        # Globale Styles & CSS-Variablen
│   ├── 📄 login.css        # Login-Seite Styles
│   ├── 📄 downloads.css    # Downloads & Admin-Interface
│   ├── 📄 blog.css         # Blog & Admin-Interface
│   └── 📄 mobile-menu.css  # Mobile Navigation
├── 📁 js/
│   ├── 📄 common.js         # Auth, Server-Status, Navigation
│   ├── 📄 login.js         # Login-Funktionalität
│   ├── 📄 downloads.js     # Downloads & Admin-Management
│   ├── 📄 blog.js          # Blog & Admin-Management
│   └── 📄 mobile-menu.js   # Mobile Navigation
├── 📁 downloads/           # Hochgeladene Download-Dateien
├── 📁 images/
│   └── 📁 blogs/           # Blog-Artikel Bilder
└── 📁 docs/
    └── 📁 readme/
        └── 📄 README.md    # Diese Dokumentation
```

## 🔧 Konfiguration

### Benutzer-Management
```json
// config/users.json
{
  "users": [
    {
      "username": "admin",
      "password": "$2b$12$...", // bcrypt gehashtes Passwort
      "role": "admin",
      "createdAt": "2025-01-15T..."
    }
  ]
}
```

### Downloads konfigurieren
```json
// config/downloads.json
{
  "categories": [
    {
      "id": "mc-plugins",
      "name": "MC Plugins",
      "icon": "fas fa-cube",
      "description": "Minecraft server plugins",
      "projects": [...]
    }
  ]
}
```

### Blog-Artikel
```json
// config/blog.json
[
  {
    "id": "artikel-id",
    "title": "Artikel Titel",
    "subtitle": "Untertitel",
    "description": "Kurze Beschreibung",
    "image": "images/blogs/bild.jpg",
    "date": "2025-01-15",
    "readTime": "5 min read",
    "tags": ["tag1", "tag2"],
    "content": {
      "introduction": "Einleitung...",
      "sections": [
        {
          "title": "Abschnitt 1",
          "content": "Inhalt..."
        }
      ]
    }
  }
]
```

## 🔗 API-Endpunkte

### Authentifizierung
- `POST /api/login` - Benutzer-Anmeldung
- `GET /api/verify` - Token-Verifikation
- `POST /api/logout` - Abmeldung

### Downloads
- `GET /api/downloads` - Alle Downloads abrufen
- `POST /api/downloads` - Neues Projekt/Download erstellen
- `PUT /api/downloads/:id` - Projekt bearbeiten
- `DELETE /api/downloads/:id` - Projekt löschen

### Blog
- `GET /api/blogs` - Alle Blog-Artikel abrufen
- `POST /api/blogs` - Neuen Artikel erstellen
- `DELETE /api/blogs/:id` - Artikel löschen

### System
- `GET /api/health` - Server-Status prüfen
- `POST /api/upload` - Datei-Upload

## 🛡️ Sicherheitsfeatures

### Passwort-Sicherheit
- **bcrypt-Hashing** mit Salt-Rounds: 12
- **JWT-Tokens** mit konfigurierbarer Ablaufzeit
- **Sichere Token-Speicherung** im localStorage

### Input-Validierung
- **File-Upload Beschränkungen** (Typ & Größe)
- **Request Rate Limiting** gegen Missbrauch
- **XSS-Schutz** durch Input-Sanitization
- **CORS-Konfiguration** für Frontend-Sicherheit

### Fehlerbehandlung
- **Graceful Error Handling** in allen APIs
- **Detaillierte Logging** für Debugging
- **User-friendly Fehlermeldungen** auf Deutsch
- **Fallback-Verhalten** bei Server-Ausfall

## 🎨 Anpassungen

### Design-System
Alle Farben sind als CSS-Variablen in `css/common.css` definiert:
```css
:root {
  --bg-primary: #0d1117;      /* Haupt-Hintergrund */
  --accent-color: #d97706;     /* Akzentfarbe (Orange) */
  --text-primary: #c9d1d9;     /* Haupttext (Weiß) */
  --text-success: #3fb950;     /* Erfolg (Grün) */
  --text-error: #f85149;       /* Fehler (Rot) */
}
```

### Neue Kategorien hinzufügen
1. `config/downloads.json` erweitern
2. Filter-Chips in `downloads.html` aktualisieren
3. Icons in `css/downloads.css` definieren

### Neue API-Endpunkte
1. Route in `server.js` hinzufügen
2. Frontend-Integration in entsprechender JS-Datei
3. Error-Handling implementieren

## 🚀 Deployment

### Produktions-Setup
1. **Environment Variables** für JWT_SECRET setzen
2. **SSL/HTTPS** für sichere Übertragung konfigurieren
3. **Reverse Proxy** (nginx) für bessere Performance
4. **Process Manager** (PM2) für Server-Stabilität

### Backup-Strategie
- **Regelmäßige Backups** von `config/` Ordner
- **Versionierung** der Konfigurationsdateien
- **Sichere Speicherung** von Benutzer-Daten

## 📞 Support

### Troubleshooting
- **Server nicht erreichbar**: Prüfe Port 3090 und Firewall
- **Login funktioniert nicht**: Verifikation der JWT-Konfiguration
- **Uploads fehlgeschlagen**: Prüfe Ordner-Berechtigungen
- **Mobile Probleme**: Cache leeren und neu laden

### Logs
- **Server-Logs**: Console-Output von `server.js`
- **Browser-Logs**: Developer Tools Console
- **Error-Tracking**: Automatisches Logging in APIs

## 🔄 Updates & Wartung

### Regelmäßige Aufgaben
- **Dependencies aktualisieren**: `npm update`
- **Sicherheits-Patches**: `npm audit fix`
- **Config-Backups**: Wöchentliche Sicherungen
- **Performance-Monitoring**: Server-Response-Zeiten prüfen

### Feature-Erweiterungen
Das System ist modular aufgebaut und kann einfach erweitert werden:
- **Neue Content-Typen** hinzufügen
- **Erweiterte Benutzer-Rollen** implementieren
- **Mehr Upload-Formate** unterstützen
- **API-Integrationen** für externe Services

---

**QuantomDocs** - Professionelle Dokumentationswebsite mit vollständigem Admin-System für moderne Minecraft Server Software.

*Entwickelt für Skalierbarkeit, Sicherheit und Benutzerfreundlichkeit.*