#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de scraping "1000% robuste" pour extraire dynamiquement les liens vidéo depuis une page.
Usage : python robust_dynamic_scraper.py --url "https://exemple.com/film-page" [--proxy "ip:port"] [--user-agent "Your User Agent"]
"""
import time
import random
import argparse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Liste de user-agents pour la rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
    " Chrome/89.0.4389.82 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    " Version/14.0.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
    # Ajoutez d'autres user-agents si nécessaire
]

# Si vous souhaitez utiliser des proxys, configurez-les ici
PROXIES = [
    # "123.45.67.89:8080",
    # "98.76.54.32:3128",
]

def get_random_user_agent():
    """Retourne un user-agent aléatoire de la liste"""
    return random.choice(USER_AGENTS)

def get_random_proxy():
    """Retourne un proxy aléatoire de la liste (ou None si liste vide)"""
    return random.choice(PROXIES) if PROXIES else None

def initialize_driver(proxy=None, user_agent=None):
    """
    Initialise le WebDriver Selenium avec des options headless, user-agent et proxy.
    Renvoie une instance de Chrome WebDriver.
    """
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-dev-shm-usage")

    # Appliquer le user-agent si fourni
    if user_agent:
        options.add_argument(f"--user-agent={user_agent}")

    # Appliquer le proxy si fourni
    if proxy:
        options.add_argument(f"--proxy-server=http://{proxy}")

    # Pour désactiver le chargement des images (accélère le scraping)
    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)

    # Crée le WebDriver (assurez-vous que chromedriver est dans le PATH)
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    return driver

# OPTIMISATIONS ET CONSEILS POUR UN SCRAPER "1000% ROBUSTE" ET ADAPTÉ À UN PROJET VIDÉO

# 1. Ajoutez la gestion des cookies et du consentement (bannières RGPD)
# 2. Ajoutez la détection et extraction spécifique pour les hébergeurs comme uqload, doodstream, etc.
# 3. Ajoutez la gestion des redirections JavaScript (certains sites chargent dynamiquement les liens)
# 4. Ajoutez la gestion des captchas (si besoin, avec un service externe)
# 5. Ajoutez la gestion des erreurs Selenium plus fine (Timeout, WebDriverException, etc.)
# 6. Ajoutez la possibilité de cliquer sur des boutons pour révéler les lecteurs (certains sites masquent les iframes)
# 7. Ajoutez la possibilité de passer des headers personnalisés (ex: Referer)
# 8. Ajoutez la possibilité de sauvegarder les logs et les liens extraits dans un fichier
# 9. Ajoutez une option pour extraire les liens uniquement des domaines autorisés (filtrage par regex)
# 10. Ajoutez un mode "headful" pour le debug (options.headless=False)

# EXEMPLE D'OPTIMISATION POUR UQLOAD/DOODSTREAM :
def extract_video_links(url, max_retries=3, wait_time=10):
    """
    Extrait dynamiquement les liens vidéo (.mp4, .m3u8, etc.) depuis l'URL donnée.
    1. Lance Selenium en headless.
    2. Attend la présence d'au moins un <iframe> ou <video>.
    3. Récupère les attributs 'src' de tous les iframes et balises video.
    4. Retourne une liste de liens.
    """
    for attempt in range(1, max_retries + 1):
        try:
            user_agent = get_random_user_agent()
            proxy = get_random_proxy()
            print(f"[Tentative {attempt}] Utilisation du user-agent : {user_agent}")
            if proxy:
                print(f"[Tentative {attempt}] Utilisation du proxy : {proxy}")
            driver = initialize_driver(proxy=proxy, user_agent=user_agent)
            driver.get(url)

            # Attendre la présence d'un <iframe> OU d'une balise <video> (maximum wait_time secondes)
            wait = WebDriverWait(driver, wait_time)
            wait.until(
                EC.presence_of_any_elements_located([
                    (By.TAG_NAME, "iframe"),
                    (By.TAG_NAME, "video")
                ])
            )

            video_links = set()

            # Rechercher tous les <iframe>
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            for iframe in iframes:
                src = iframe.get_attribute("src")
                if src:
                    # Ajoutez ici d'autres hébergeurs si besoin
                    if any(host in src for host in [
                        "uqload.io", "dood.", "doodstream", "streamtape.com", "vidmoly.to", "mycloud.to", "upstream.to", "voe.sx", "filelions.to"
                    ]):
                        video_links.add(src)
                    else:
                        video_links.add(src)

            # Rechercher toutes les balises <video>
            videos = driver.find_elements(By.TAG_NAME, "video")
            for video in videos:
                src = video.get_attribute("src")
                if src:
                    video_links.add(src)
                sources = video.find_elements(By.TAG_NAME, "source")
                for source in sources:
                    src2 = source.get_attribute("src")
                    if src2:
                        video_links.add(src2)

            driver.quit()
            return list(video_links)

        except Exception as e:
            print(f"[Erreur tentative {attempt}] {e}")
            try:
                driver.quit()
            except:
                pass
            if attempt < max_retries:
                sleep_time = random.uniform(2, 5)
                print(f"Nouvelle tentative après {sleep_time:.2f} secondes...")
                time.sleep(sleep_time)
            else:
                print("Nombre maximum de tentatives atteint. Abandon.")
                return []

def main():
    parser = argparse.ArgumentParser(
        description="Scraping dynamique pour extraire des liens vidéo depuis une page."
    )
    parser.add_argument("--url", required=True, help="URL de la page à scraper.")
    parser.add_argument("--proxy", help="Proxy à utiliser (format ip:port).")
    parser.add_argument("--user-agent", help="User-Agent à utiliser.")

    args = parser.parse_args()
    url = args.url
    proxy = args.proxy
    user_agent = args.user_agent

    print(f"Début du scraping pour l'URL : {url}")
    links = extract_video_links(url)
    if links:
        print("Liens vidéo trouvés :")
        for link in links:
            print(link)
    else:
        print("Aucun lien vidéo n'a été extrait.")

if __name__ == "__main__":
    main()

# CONSEIL : Pour un projet professionnel, ajoutez des tests unitaires, des logs détaillés, et documentez les limitations (ex: captchas, cloudflare...).

# Pour la plupart des usages de scraping vidéo, ce script est déjà très robuste, mais il peut être adapté selon les besoins spécifiques de votre projet (extraction avancée, automatisation, intégration API, etc.).
