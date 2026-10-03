# Vodič za postavljanje `jubilej.fgag.eu` na VPS

Ovaj projekt (`55-godina`) je **potpuno samostalan** i ne dira postojeći `fgag-eu-generator`.

---

## 1. Kloniranje repozitorija na VPS

Prijavite se na vaš VPS poslužitelj i klonirajte repozitorij u zasebnu mapu:

```bash
cd /var/www
git clone https://github.com/mariomatrix/55-godina.git jubilej.fgag.eu
cd jubilej.fgag.eu
```

*(Nije potreban `npm install` jer poslužitelj koristi isključivo nativne Node.js module).*

---

## 2. Pokretanje poslužitelja preko PM2

Pokrenite samostalni poslužitelj koji će automatski raditi u pozadini i ponovno se pokretati pri restartu servera:

```bash
# Pokretanje na zadanom portu 8055
PORT=8055 pm2 start server.js --name "jubilej-fgag"

# Spremi stanje za automatski start nakon restarta VPS-a
pm2 save
```

---

## 3. Konfiguracija Nginx virtual hosta

Kopirajte pripremljenu Nginx konfiguraciju:

```bash
sudo cp deploy/nginx-jubilej.conf /etc/nginx/sites-available/jubilej.fgag.eu
sudo ln -s /etc/nginx/sites-available/jubilej.fgag.eu /etc/nginx/sites-enabled/
```

Provjerite ispravnost i ponovno učitajte Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Provjera rada

Budući da Cloudflare već usmjerava `*.fgag.eu` na vaš VPS, čim Nginx preusmjeri zahtjev za `jubilej.fgag.eu`:
- Stranica je odmah vidljiva na `https://jubilej.fgag.eu/`
- Globalni brojač se automatski bilježi u `/var/www/jubilej.fgag.eu/data/counter.json`
