import discord
from discord.commands import SlashCommandGroup
from discord.ext import commands
import json
import os
from pathlib import Path
import datetime
import secrets
import shutil

# ==============================================================================
# │ CONFIGURATION                                                              │
# ==============================================================================
# Trage hier den Token deines Discord Bots ein.
BOT_TOKEN = "MTAzNzgxNjYxMjIzMDgwNzYxMg.Gd_-7R.CFKuo-HY1dMsmp5MGRhnG67oik588bv1oB7cZM"

# Der "homepath" zum Hauptverzeichnis der Website. 
# Da bot.py im Hauptverzeichnis liegt, können wir "." verwenden, 
# was "aktuelles Verzeichnis" bedeutet. Ein absoluter Pfad ist sicherer.
# Beispiel: "/var/www/quantomdocs"
HOME_PATH = "." 
# ==============================================================================


class QuantomBot(discord.Bot):
    """
    Ein Discord-Bot zur Verwaltung der downloads.json und der zugehörigen Dateien
    für die QuantomSystems-Website.
    """
    def __init__(self, home_path: str):
        super().__init__(intents=discord.Intents.default())
        
        # Pfade konfigurieren
        self.home_path = Path(home_path).resolve()
        self.downloads_json_path = self.home_path / "config" / "downloads.json"
        self.downloads_dir = self.home_path / "downloads"
        
        print("Bot wird initialisiert...")
        print(f"Home Path: {self.home_path}")
        print(f"Downloads JSON: {self.downloads_json_path}")
        print(f"Downloads Ordner: {self.downloads_dir}")

        # Erstelle die benötigten Dateien/Ordner, falls sie nicht existieren
        self._setup_files()
        
        # Füge die Slash Command Group und den Help-Befehl explizit hinzu
        self.add_application_command(self.manage)
        self.add_application_command(self.help_command)
        print(f"Intern registrierte Befehle nach __init__: {len(self.commands)}")

    def _setup_files(self):
        """Stellt sicher, dass die downloads.json und der downloads-Ordner existieren."""
        # Stelle sicher, dass der 'config'-Ordner existiert
        self.downloads_json_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not self.downloads_json_path.exists():
            print("downloads.json nicht gefunden. Erstelle eine neue leere Datei.")
            with open(self.downloads_json_path, 'w') as f:
                json.dump([], f)
        
        if not self.downloads_dir.exists():
            print("Downloads-Ordner nicht gefunden. Erstelle ihn.")
            self.downloads_dir.mkdir()

    async def on_ready(self):
        """Wird aufgerufen, wenn der Bot erfolgreich mit Discord verbunden ist."""
        print(f'Erfolgreich eingeloggt als {self.user}')
        
        print("Synchronisiere Slash Commands global...")
        await self.sync_commands() # Befehle global synchronisieren
        print(f"Slash Commands synchronisiert. {len(self.commands)} Befehle registriert.")
        activity = discord.Game(name="QuantomSystem auf Snenjih.de")
        await self.change_presence(status=discord.Status.dnd, activity=activity)

    # --- Helper-Methoden ---

    def _load_data(self):
        """Lädt die Daten aus der downloads.json Datei."""
        try:
            with open(self.downloads_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Falls die Datei korrupt oder leer ist, starte mit einer leeren Liste
            return []

    def _save_data(self, data):
        """Speichert die Daten in die downloads.json Datei."""
        with open(self.downloads_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _create_embed(self, title: str, description: str, color: discord.Color) -> discord.Embed:
        """Erstellt ein standardisiertes Embed mit Footer."""
        embed = discord.Embed(title=title, description=description, color=color)
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        embed.set_footer(text=f"QuantomSystems | {timestamp}")
        return embed
    
    def _generate_hash(self, length: int = 7) -> str:
        """Generiert einen zufälligen hexadezimalen Hash."""
        return secrets.token_hex(length // 2 + 1)[:length]

    # --- Slash Commands ---
    
    manage = SlashCommandGroup("manage", "Befehle zur Verwaltung von Versionen")

    @manage.command(name="addversion", description="Fügt eine neue Version hinzu oder aktualisiert eine bestehende.")
    @commands.has_permissions(administrator=True)
    async def add_version(
        self,
        ctx: discord.ApplicationContext,
        version_name: discord.Option(str, "Der Name des Projekts (z.B. LobbySystem)."),
        commits: discord.Option(str, "Commit-Nachrichten, eine pro Zeile."),
        datei: discord.Option(discord.Attachment, "Die hochzuladende Datei (z.B. .jar).")
    ):
        await ctx.defer() # Zeit für die Verarbeitung geben

        try:
            data = self._load_data()
            project_entry = next((p for p in data if p.get("versionName") == version_name), None)

            build_number = 1
            if project_entry:
                # Projekt existiert, finde die höchste Build-Nummer und erhöhe sie
                if project_entry.get("changelogs"):
                    highest_build = max(c.get("buildNumber", 0) for c in project_entry["changelogs"])
                    build_number = highest_build + 1
            else:
                # Neues Projekt erstellen
                project_entry = {
                    "versionName": version_name,
                    "maintained": True,
                    "changelogs": []
                }
                data.append(project_entry)

            # Dateinamen und Pfade vorbereiten
            file_extension = Path(datei.filename).suffix
            new_filename = f"{version_name}-{build_number}{file_extension}"
            version_folder = self.downloads_dir / version_name
            version_folder.mkdir(exist_ok=True) # Erstellt den Ordner, wenn nicht vorhanden
            save_path = version_folder / new_filename
            download_path = f"downloads/{version_name}/{new_filename}"

            # Datei speichern
            await datei.save(save_path)

            # Changelog-Eintrag erstellen
            commit_list = [
                {"hash": self._generate_hash(), "message": msg.strip()}
                for msg in commits.strip().split('\n') if msg.strip()
            ]

            new_changelog = {
                "buildNumber": build_number,
                "commits": commit_list,
                "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                "downloadPath": download_path
            }

            project_entry["changelogs"].insert(0, new_changelog)
            self._save_data(data)
            
            # Erfolgsnachricht
            commit_messages = "\n".join([f"- `{c['hash']}` {c['message']}" for c in commit_list])
            embed = self._create_embed(
                "✅ Version erfolgreich hinzugefügt",
                f"**Projekt:** `{version_name}`\n"
                f"**Build-Nummer:** `{build_number}`\n"
                f"**Datei:** `{new_filename}`\n\n"
                f"**Commits:**\n{commit_messages}",
                discord.Color.green()
            )
            await ctx.followup.send(embed=embed)

        except Exception as e:
            print(f"Fehler bei /addversion: {e}")
            embed = self._create_embed("❌ Fehler", f"Ein unerwarteter Fehler ist aufgetreten: `{e}`", discord.Color.red())
            await ctx.followup.send(embed=embed)

    @manage.command(name="removechangelog", description="Entfernt einen spezifischen Changelog (Build).")
    @commands.has_permissions(administrator=True)
    async def remove_changelog(
        self,
        ctx: discord.ApplicationContext,
        version_name: discord.Option(str, "Der Name des Projekts."),
        build_number: discord.Option(int, "Die zu löschende Build-Nummer.")
    ):
        await ctx.defer()
        data = self._load_data()
        project_entry = next((p for p in data if p.get("versionName") == version_name), None)

        if not project_entry:
            embed = self._create_embed("❌ Fehler", f"Projekt `{version_name}` nicht gefunden.", discord.Color.red())
            await ctx.followup.send(embed=embed)
            return

        changelog_to_remove = next((c for c in project_entry["changelogs"] if c.get("buildNumber") == build_number), None)

        if not changelog_to_remove:
            embed = self._create_embed("❌ Fehler", f"Build-Nummer `{build_number}` für `{version_name}` nicht gefunden.", discord.Color.red())
            await ctx.followup.send(embed=embed)
            return

        # Datei löschen
        file_path = self.home_path / changelog_to_remove.get("downloadPath", "")
        if file_path.exists():
            try:
                os.remove(file_path)
            except OSError as e:
                embed = self._create_embed("⚠️ Warnung", f"Konnte die Datei nicht löschen: `{e}`. Der JSON-Eintrag wird trotzdem entfernt.", discord.Color.orange())
                await ctx.followup.send(embed=embed)

        # Eintrag aus JSON entfernen
        project_entry["changelogs"].remove(changelog_to_remove)
        self._save_data(data)

        embed = self._create_embed(
            "🗑️ Changelog erfolgreich entfernt",
            f"Der Changelog für **{version_name}** mit der Build-Nummer **{build_number}** wurde gelöscht.",
            discord.Color.blue()
        )
        await ctx.followup.send(embed=embed)


    @manage.command(name="removeversion", description="Entfernt ein komplettes Projekt mit allen Dateien.")
    @commands.has_permissions(administrator=True)
    async def remove_version(
        self,
        ctx: discord.ApplicationContext,
        version_name: discord.Option(str, "Der Name des zu löschenden Projekts.")
    ):
        await ctx.defer()
        data = self._load_data()
        project_entry = next((p for p in data if p.get("versionName") == version_name), None)

        if not project_entry:
            embed = self._create_embed("❌ Fehler", f"Projekt `{version_name}` nicht gefunden.", discord.Color.red())
            await ctx.followup.send(embed=embed)
            return

        # Ordner löschen
        version_folder = self.downloads_dir / version_name
        if version_folder.exists():
            try:
                shutil.rmtree(version_folder)
            except OSError as e:
                embed = self._create_embed("⚠️ Warnung", f"Konnte den Ordner `{version_folder}` nicht löschen: `{e}`. Der JSON-Eintrag wird trotzdem entfernt.", discord.Color.orange())
                await ctx.followup.send(embed=embed)

        # Eintrag aus JSON entfernen
        data.remove(project_entry)
        self._save_data(data)

        embed = self._create_embed(
            "🗑️ Version erfolgreich entfernt",
            f"Das gesamte Projekt **{version_name}** und alle zugehörigen Dateien wurden gelöscht.",
            discord.Color.dark_blue()
        )
        await ctx.followup.send(embed=embed)

    @discord.slash_command(name="help", description="Zeigt eine Übersicht aller Befehle an.")
    async def help_command(self, ctx: discord.ApplicationContext):
        embed = self._create_embed(
            "Hilfe für den QuantomSystems Bot",
            "Hier ist eine Liste aller verfügbaren Befehle und ihre Funktion.",
            discord.Color.purple()
        )
        embed.add_field(
            name="/manage addversion",
            value="**Argumente:** `version_name`, `commits`, `datei`\n"
                  "Fügt eine neue Version hinzu. `commits` müssen durch Zeilenumbrüche getrennt sein.",
            inline=False
        )
        embed.add_field(
            name="/manage removechangelog",
            value="**Argumente:** `version_name`, `build_number`\n"
                  "Entfernt einen spezifischen Build einer Version.",
            inline=False
        )
        embed.add_field(
            name="/manage removeversion",
            value="**Argumente:** `version_name`\n"
                  "Entfernt ein komplettes Projekt mit allen Dateien.",
            inline=False
        )
        embed.add_field(
            name="/help",
            value="Zeigt diese Hilfenachricht an.",
            inline=False
        )
        await ctx.respond(embed=embed, ephemeral=True) # ephemeral = nur für den User sichtbar

    async def on_application_command_error(self, ctx: discord.ApplicationContext, error: discord.DiscordException):
        """Globaler Error Handler für Slash Commands."""
        if isinstance(error, commands.MissingPermissions):
            embed = self._create_embed(
                "🚫 Fehlende Berechtigungen",
                "Du hast nicht die erforderlichen Berechtigungen (Administrator), um diesen Befehl auszuführen.",
                discord.Color.dark_red()
            )
            await ctx.respond(embed=embed, ephemeral=True)
        else:
            # Für alle anderen Fehler
            print(f"Ein Fehler ist aufgetreten: {error}")
            embed = self._create_embed(
                "❌ Ein Fehler ist aufgetreten",
                f"Es gab ein Problem bei der Ausführung des Befehls.\n```\n{error}\n```",
                discord.Color.red()
            )
            await ctx.respond(embed=embed, ephemeral=True)


# --- Bot starten ---
if __name__ == "__main__":
    if BOT_TOKEN == "MTAzNzgxNjYxMjIzMDgwNzYxMg.G1XS-w.ZMHsUhQ5rgjeCAhMQfJRHXyEDH_Ue_1fPF6mW4":
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! FEHLER: Bitte trage deinen Bot-Token in der bot.py ein. !!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        bot = QuantomBot(home_path=HOME_PATH)
        bot.run(BOT_TOKEN)
