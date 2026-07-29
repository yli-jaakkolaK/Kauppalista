#!/bin/bash
# Varmuuskopioi KOKO Supabase-tietokannan yhdellä komennolla pg_dumpilla.
# Ks. BACKUP.md ensimmäistä kertaa ajaessa (kertaluontoinen asennus + mistä
# SUPABASE_DB_URL löytyy) — tämä skripti itsessään ei tee mitään taikaa,
# se on vain pg_dump + kansiologiikka yhdessä paketissa.
#
# Käyttö:
#   SUPABASE_DB_URL="postgresql://..." ./scripts/varmuuskopio.sh
#
# Tallennuspaikka: jos koneella on iCloud Drive käytössä, kopio menee
# automaattisesti sinne (~/Library/Mobile Documents/com~apple~CloudDocs/...)
# jolloin se synkkautuu pilveen ITSESTÄÄN, ei tarvitse siirtää käsin. Jos
# iCloud Drive -kansiota ei löydy, kopio menee ~/Documents/Satama-varmuuskopiot/
# ja se pitää siirtää pilveen KÄSIN (ks. BACKUP.md).

set -e

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "VIRHE: aseta ensin SUPABASE_DB_URL. Ks. BACKUP.md mistä se löytyy." >&2
  echo "Esimerkki: SUPABASE_DB_URL=\"postgresql://...\" ./scripts/varmuuskopio.sh" >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "VIRHE: pg_dump ei ole asennettu. Ks. BACKUP.md kohta 'Kertaluontoinen asennus'." >&2
  exit 1
fi

ICLOUD_KANSIO="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Satama-varmuuskopiot"
PAIKALLINEN_KANSIO="$HOME/Documents/Satama-varmuuskopiot"

if [ -d "$HOME/Library/Mobile Documents/com~apple~CloudDocs" ]; then
  KANSIO="$ICLOUD_KANSIO"
  echo "iCloud Drive löytyi — kopio menee sinne ja synkkautuu pilveen automaattisesti."
else
  KANSIO="$PAIKALLINEN_KANSIO"
  echo "HUOM: iCloud Drive -kansiota ei löytynyt. Kopio tallennetaan paikallisesti:"
  echo "  $KANSIO"
  echo "MUISTA SIIRTÄÄ SE KÄSIN PILVEEN (ks. BACKUP.md) — pelkkä paikallinen kopio ei riitä."
fi

mkdir -p "$KANSIO"

AIKALEIMA=$(date +%Y-%m-%d_%H-%M-%S)
TIEDOSTO="$KANSIO/satama_varmuuskopio_${AIKALEIMA}.sql"

echo "Varmuuskopioidaan Supabase-tietokanta..."
pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges --format=plain -f "$TIEDOSTO"

echo ""
echo "✓ Valmis: $TIEDOSTO"
echo "Koko: $(du -h "$TIEDOSTO" | cut -f1)"
