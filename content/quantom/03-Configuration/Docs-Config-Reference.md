# Docs Config Reference

Diese umfassende Dokumentation beschreibt alle verfügbaren Konfigurationsoptionen in der `docs-config.json` Datei. Die Config-Datei steuert das Verhalten und Aussehen der gesamten Dokumentationsseite.

## Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Dateistruktur](#dateistruktur)
- [General Settings](#general-settings)
- [Header Configuration](#header-configuration)
- [Products Configuration](#products-configuration)
- [Beispiele](#beispiele)
- [Best Practices](#best-practices)
- [Häufige Probleme](#häufige-probleme)

---

## Übersicht

Die `docs-config.json` befindet sich unter `src/docs/config/docs-config.json` und ist die zentrale Konfigurationsdatei für die Dokumentationsseite. Sie verwendet das JSON-Format mit zusätzlichen `_comment`-Feldern zur Dokumentation.

### Hauptbereiche

1. **general** - Allgemeine Einstellungen für die Dokumentationsseite
2. **header** - Konfiguration für die Header-Navigation
3. **products** - Liste aller verfügbaren Dokumentations-Produkte

---

## Dateistruktur

```json
{
  "general": { ... },
  "header": { ... },
  "products": [ ... ]
}
```

---

## General Settings

Der `general`-Bereich enthält grundlegende Einstellungen für das Verhalten der Dokumentationsseite.

### default

**Typ:** `boolean`
**Standard:** `true`
**Erforderlich:** Ja

Legt fest, ob beim Aufruf von `/docs` automatisch ein Standard-Produkt geladen werden soll.

**Werte:**
- `true` - Lädt automatisch das in `defaultProduct` angegebene Produkt
- `false` - Zeigt die Produkt-Übersichtsseite an

**Beispiel:**
```json
"default": true
```

**Anwendungsfall:**
Wenn Sie nur ein Produkt haben oder Benutzer direkt zur Dokumentation eines spezifischen Produkts leiten möchten, setzen Sie dies auf `true`.

---

### defaultProduct

**Typ:** `string`
**Standard:** `"quantom"`
**Erforderlich:** Ja (wenn `default` = `true`)

Die ID des Produkts, das standardmäßig geladen werden soll. Muss mit einer `id` in der `products`-Liste übereinstimmen.

**Format:** Kleinbuchstaben, keine Leerzeichen
**Beispiel:**
```json
"defaultProduct": "quantom"
```

**Wichtig:**
Die angegebene ID muss exakt mit der `id` eines Produkts in der `products`-Liste übereinstimmen, sonst wird eine Fehlermeldung angezeigt.

---

### sidebarRightHeaders

**Typ:** `object`
**Erforderlich:** Ja

Konfiguriert, welche Überschriftsebenen im rechten Sidebar-Inhaltsverzeichnis angezeigt werden sollen.

#### Unterfelder

##### mainSectionHeader

**Typ:** `boolean`
**Standard:** `true`
**Beschreibung:** Zeigt H1-Überschriften im Inhaltsverzeichnis an

**Beispiel:**
```json
"mainSectionHeader": true
```

##### subSectionHeader

**Typ:** `boolean`
**Standard:** `true`
**Beschreibung:** Zeigt H2-Überschriften im Inhaltsverzeichnis an

**Beispiel:**
```json
"subSectionHeader": true
```

##### subSubSectionHeader

**Typ:** `boolean`
**Standard:** `false`
**Beschreibung:** Zeigt H3-Überschriften im Inhaltsverzeichnis an

**Beispiel:**
```json
"subSubSectionHeader": false
```

**Vollständiges Beispiel:**
```json
"sidebarRightHeaders": {
  "mainSectionHeader": true,
  "subSectionHeader": true,
  "subSubSectionHeader": false
}
```

**Best Practice:**
Für bessere Übersichtlichkeit empfiehlt es sich, nicht alle drei Ebenen gleichzeitig anzuzeigen. Eine Kombination aus H1 und H2 oder H2 und H3 funktioniert in den meisten Fällen am besten.

---

### rightSidebarSectionGap

**Typ:** `boolean`
**Standard:** `true`
**Erforderlich:** Ja

Aktiviert visuelle Einrückung für H2 und H3 Überschriften im Inhaltsverzeichnis, um die Hierarchie besser darzustellen.

**Werte:**
- `true` - H2 und H3 werden eingerückt dargestellt
- `false` - Alle Überschriften auf gleicher Ebene

**Beispiel:**
```json
"rightSidebarSectionGap": true
```

**Visueller Unterschied:**

Mit `true`:
```
Introduction
  Getting Started
  Installation
Configuration
  Basic Setup
  Advanced Options
```

Mit `false`:
```
Introduction
Getting Started
Installation
Configuration
Basic Setup
Advanced Options
```

---

## Header Configuration

Der `header`-Bereich konfiguriert die Navigation und Links im Header der Seite.

### links

**Typ:** `array`
**Erforderlich:** Ja
**Beschreibung:** Liste aller Links, die im Header angezeigt werden sollen

Jedes Link-Objekt in der Liste kann folgende Eigenschaften haben:

#### Link-Objekt Eigenschaften

##### name

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Der angezeigte Text des Links

**Beispiel:**
```json
"name": "Home"
```

**Empfehlung:** Kurz und prägnant halten (1-2 Wörter)

---

##### url

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Die URL oder der Pfad, zu dem der Link führt

**Format:**
- Relativ: `/main`, `/downloads`, `/docs`
- Absolut: `https://discord.gg/example`

**Beispiele:**
```json
"url": "/main"
"url": "https://discord.gg/f46gXT69Fd"
```

---

##### special

**Typ:** `boolean`
**Standard:** `false`
**Erforderlich:** Nein
**Beschreibung:** Bestimmt, ob der Link als hervorgehobener "Special Button" angezeigt wird

**Werte:**
- `true` - Wird als auffälliger Button mit besonderem Styling dargestellt (wie der Download-Button)
- `false` - Wird als normaler Navigations-Link dargestellt

**Beispiel:**
```json
"special": true
```

**Wichtig:** Es sollte nur **ein** Link als Special Button markiert sein, um die visuelle Hierarchie zu erhalten.

**Styling-Unterschied:**
- Normal: Einfacher Text-Link in Header-Farbe
- Special: Button mit Hintergrundfarbe, Border und Hover-Effekt

---

##### external

**Typ:** `boolean`
**Standard:** `false`
**Erforderlich:** Nein
**Beschreibung:** Gibt an, ob der Link zu einer externen Seite führt

**Werte:**
- `true` - Link öffnet in neuem Tab (`target="_blank"` und `rel="noopener noreferrer"`)
- `false` - Link öffnet in gleichem Tab

**Beispiel:**
```json
"external": true
```

**Automatisches Verhalten bei `external: true`:**
- Öffnet in neuem Browser-Tab
- Fügt `rel="noopener noreferrer"` für Sicherheit hinzu
- Verhindert Zugriff der Zielseite auf `window.opener`

---

### Vollständiges Header-Beispiel

```json
"header": {
  "links": [
    {
      "name": "Home",
      "url": "/main",
      "special": false,
      "external": false
    },
    {
      "name": "Download",
      "url": "/downloads",
      "special": true,
      "external": false
    },
    {
      "name": "Discord",
      "url": "https://discord.gg/f46gXT69Fd",
      "special": false,
      "external": true
    },
    {
      "name": "GitHub",
      "url": "https://github.com/yourorg/yourrepo",
      "special": false,
      "external": true
    }
  ]
}
```

---

## Products Configuration

Der `products`-Bereich enthält eine Liste aller verfügbaren Dokumentations-Produkte.

### Product-Objekt

Jedes Produkt ist ein Objekt mit folgenden Eigenschaften:

#### id

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Eindeutige Identifikation des Produkts

**Format:**
- Nur Kleinbuchstaben und Zahlen
- Keine Leerzeichen
- Keine Sonderzeichen (außer `-`)
- Wird in URLs verwendet

**Beispiele:**
```json
"id": "quantom"
"id": "terminus"
"id": "my-product-v2"
```

**Wichtig:** Die ID wird in der URL verwendet (`/docs/{id}`) und muss eindeutig sein.

---

#### name

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Anzeigename des Produkts in der Benutzeroberfläche

**Beispiele:**
```json
"name": "Quantom Server"
"name": "Terminus Terminal"
```

**Verwendung:**
- Produkt-Übersichtsseite
- Navigation
- Seitentitel

---

#### description

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Kurze Beschreibung des Produkts

**Empfehlungen:**
- Maximal 150 Zeichen
- Klar und prägnant
- Beschreibt den Hauptzweck des Produkts

**Beispiele:**
```json
"description": "High-performance Minecraft server software optimized for large networks"
"description": "Modern lightweight web-based Terminal and remote file browser client"
```

**Verwendung:** Wird auf der Produkt-Übersichtskarte angezeigt.

---

#### path

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Dateipfad zum Produkt-Verzeichnis (relativ zu `src/docs/content/`)

**Format:** Normalerweise identisch mit `id`

**Beispiele:**
```json
"path": "quantom"
"path": "terminus"
```

**Wichtig:** Das Verzeichnis muss existieren unter `src/docs/content/{path}/`

---

#### icon

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Icon oder Emoji für das Produkt

**Formate:**
- Emoji: `"🚀"`, `"📦"`, `"⚡"`
- Font Awesome: `"fas fa-rocket"`, `"fas fa-server"`

**Beispiele:**
```json
"icon": "🚀"
"icon": "fas fa-terminal"
```

**Verwendung:**
- Produkt-Übersichtskarte
- Navigation
- Sidebar

---

#### showInDocs

**Typ:** `boolean`
**Erforderlich:** Ja
**Beschreibung:** Bestimmt die Sichtbarkeit des Produkts in der Dokumentation

**Werte:**
- `true` - Produkt wird angezeigt und ist zugänglich
- `false` - Produkt ist versteckt (z.B. für Beta-Features)

**Beispiel:**
```json
"showInDocs": true
```

**Anwendungsfall:**
Setzen Sie dies auf `false`, um Produkte zu verstecken, die noch in Entwicklung sind oder temporär deaktiviert werden sollen.

---

#### firstSide

**Typ:** `string`
**Erforderlich:** Ja
**Beschreibung:** Pfad zur ersten Markdown-Datei, die beim Öffnen des Produkts geladen wird

**Format:** `produkt-id/kategorie/Dateiname.md`
**Relativ zu:** `src/docs/content/`

**Beispiele:**
```json
"firstSide": "quantom/01-Getting-Started/Installation.md"
"firstSide": "terminus/01-Documentation/Introduction.md"
```

**Wichtig:**
- Die Datei muss existieren
- Der Pfad ist case-sensitive
- Muss die `.md` Endung haben

---

### Vollständiges Product-Beispiel

```json
{
  "id": "quantom",
  "name": "Quantom Server",
  "description": "High-performance Minecraft server software optimized for large networks",
  "path": "quantom",
  "icon": "🚀",
  "showInDocs": true,
  "firstSide": "quantom/01-Getting-Started/Installation.md"
}
```

---

## Beispiele

### Minimale Konfiguration

```json
{
  "general": {
    "default": false,
    "defaultProduct": "quantom",
    "sidebarRightHeaders": {
      "mainSectionHeader": true,
      "subSectionHeader": true,
      "subSubSectionHeader": false
    },
    "rightSidebarSectionGap": true
  },
  "header": {
    "links": [
      {
        "name": "Home",
        "url": "/main",
        "special": false,
        "external": false
      }
    ]
  },
  "products": [
    {
      "id": "my-product",
      "name": "My Product",
      "description": "A simple product",
      "path": "my-product",
      "icon": "📦",
      "showInDocs": true,
      "firstSide": "my-product/01-Start/Introduction.md"
    }
  ]
}
```

### Erweiterte Konfiguration mit mehreren Produkten

```json
{
  "general": {
    "default": true,
    "defaultProduct": "quantom",
    "sidebarRightHeaders": {
      "mainSectionHeader": true,
      "subSectionHeader": true,
      "subSubSectionHeader": true
    },
    "rightSidebarSectionGap": true
  },
  "header": {
    "links": [
      {
        "name": "Home",
        "url": "/main",
        "special": false,
        "external": false
      },
      {
        "name": "Pricing",
        "url": "/pricing",
        "special": false,
        "external": false
      },
      {
        "name": "Download",
        "url": "/downloads",
        "special": true,
        "external": false
      },
      {
        "name": "Discord",
        "url": "https://discord.gg/example",
        "special": false,
        "external": true
      },
      {
        "name": "GitHub",
        "url": "https://github.com/example/repo",
        "special": false,
        "external": true
      }
    ]
  },
  "products": [
    {
      "id": "quantom",
      "name": "Quantom Server",
      "description": "High-performance Minecraft server software",
      "path": "quantom",
      "icon": "🚀",
      "showInDocs": true,
      "firstSide": "quantom/01-Getting-Started/Installation.md"
    },
    {
      "id": "terminus",
      "name": "Terminus Terminal",
      "description": "Modern web-based terminal client",
      "path": "terminus",
      "icon": "⚡",
      "showInDocs": true,
      "firstSide": "terminus/01-Introduction/Overview.md"
    },
    {
      "id": "beta-product",
      "name": "Beta Feature",
      "description": "Coming soon - currently in development",
      "path": "beta",
      "icon": "🔧",
      "showInDocs": false,
      "firstSide": "beta/01-Start/Intro.md"
    }
  ]
}
```

---

## Best Practices

### Allgemein

1. **Validierung:** Verwenden Sie einen JSON-Validator, bevor Sie Änderungen deployen
2. **Backup:** Erstellen Sie immer ein Backup vor größeren Änderungen
3. **Konsistenz:** Halten Sie Namenskonventionen einheitlich (z.B. alle IDs in Kleinbuchstaben)
4. **Dokumentation:** Nutzen Sie `_comment`-Felder für zusätzliche Erklärungen

### Header Links

1. **Weniger ist mehr:** Maximal 5-6 Links im Header für bessere Übersichtlichkeit
2. **Ein Special Button:** Markieren Sie nur einen Link als "special" (Hauptaktion)
3. **Reihenfolge:** Wichtigste Links zuerst
4. **Externe Links:** Markieren Sie diese immer mit `"external": true`

### Produkte

1. **Eindeutige IDs:** Verwenden Sie sprechende, aber kurze IDs
2. **Beschreibungen:** Halten Sie diese kurz und aussagekräftig
3. **Icons:** Wählen Sie passende Icons, die das Produkt repräsentieren
4. **Struktur:** Organisieren Sie Produkt-Verzeichnisse einheitlich

### Sidebar

1. **Nicht zu tief:** Vermeiden Sie es, alle drei Überschriftsebenen gleichzeitig anzuzeigen
2. **Hierarchie:** Nutzen Sie `rightSidebarSectionGap: true` für bessere Lesbarkeit
3. **Konsistenz:** Verwenden Sie einheitliche Überschriftsebenen in Ihren Markdown-Dateien

---

## Häufige Probleme

### Config wird nicht geladen

**Problem:** Änderungen in der Config werden nicht angezeigt

**Lösungen:**
1. Cache leeren (Hard Reload: `Ctrl+Shift+R` oder `Cmd+Shift+R`)
2. JSON-Syntax überprüfen (fehlende Kommas, Klammern)
3. Browser-Konsole auf Fehler prüfen

---

### Produkt wird nicht angezeigt

**Mögliche Ursachen:**
1. `"showInDocs": false` gesetzt
2. `id` stimmt nicht mit `path` überein
3. Verzeichnis unter `src/docs/content/{path}/` existiert nicht
4. `firstSide` Datei existiert nicht

**Lösung:** Überprüfen Sie alle oben genannten Punkte

---

### Header-Links funktionieren nicht

**Mögliche Ursachen:**
1. Falsche URL-Syntax
2. Fehlendes `"external": true` bei externen Links
3. JSON-Syntax-Fehler im `links`-Array

**Lösung:**
- Überprüfen Sie die URL (relativ vs. absolut)
- Validieren Sie die JSON-Syntax
- Prüfen Sie Browser-Konsole auf Fehler

---

### Default-Produkt lädt nicht

**Mögliche Ursachen:**
1. `"default": false` gesetzt
2. `defaultProduct` ID existiert nicht in `products`
3. Tippfehler in der ID (case-sensitive!)

**Lösung:**
- Setzen Sie `"default": true`
- Überprüfen Sie, ob die `defaultProduct` ID exakt mit einer Produkt-ID übereinstimmt

---

### Sidebar-Überschriften fehlen

**Mögliche Ursachen:**
1. Alle `sidebarRightHeaders` auf `false` gesetzt
2. Markdown-Datei hat keine Überschriften
3. Überschriften haben falsche Ebene (z.B. nur H4, aber nur H1-H3 aktiviert)

**Lösung:**
- Aktivieren Sie mindestens eine Überschriftsebene
- Überprüfen Sie Ihre Markdown-Dateien
- Nutzen Sie die richtigen Überschriftsebenen (H1-H3)

---

## Technische Details

### Dateipfad
```
src/docs/config/docs-config.json
```

### Verwendung im Code

Die Config wird an folgenden Stellen geladen:

1. **src/shared/js/common.js** - Für allgemeine Header-Generierung
2. **src/shared/js/header.js** - Für Main-Page Header
3. **src/docs/js/docs-header.js** - Für Docs-Page Header
4. **src/docs/js/docs-products.js** - Für Produktverwaltung

### Caching

Die Config-Datei wird per `fetch()` geladen und kann vom Browser gecacht werden. Bei Änderungen:
1. Hard Reload durchführen
2. Service Worker Cache leeren (falls vorhanden)

---

## Änderungsprotokoll

### Version 2.0 (Aktuell)
- ✅ Ungenutzte Einstellungen entfernt (`superCategories`, `navigation`, `errorPages`)
- ✅ Neue `header.links` Konfiguration hinzugefügt
- ✅ Dynamische Link-Generierung implementiert
- ✅ Vollständige Dokumentation mit `_comment`-Feldern

### Version 1.0 (Legacy)
- Basis-Konfiguration mit `general` und `products`
- Hardcodierte Header-Links
- Statische Navigation

---

## Support & Hilfe

Bei Problemen oder Fragen zur Config:

1. **Dokumentation prüfen:** Lesen Sie diese Referenz sorgfältig durch
2. **JSON validieren:** Nutzen Sie einen JSON-Validator (z.B. jsonlint.com)
3. **Browser-Konsole:** Überprüfen Sie auf JavaScript-Fehler
4. **Discord:** Stellen Sie Fragen in unserem Discord-Server
5. **GitHub Issues:** Melden Sie Bugs oder Feature-Requests

---

**Zuletzt aktualisiert:** November 2024
**Version:** 2.0
