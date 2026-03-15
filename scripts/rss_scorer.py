#!/usr/bin/env python3
"""
RSS Article Scorer & Filter — Veille IA CGIWebContent
=====================================================
Lit les sources RSS définies dans sources-rss.md, récupère les articles,
les score par pertinence et génère un rapport filtré.

Usage:
    python3 rss_scorer.py [--min-score 3] [--max-articles 50] [--output report.json]
"""

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional
from urllib.request import urlopen, Request
from urllib.error import URLError
from html.parser import HTMLParser

# ─── Configuration ───────────────────────────────────────────────────────────

# Keywords pondérés pour le scoring automatique (mot, poids)
AI_KEYWORDS = {
    # Très pertinents (poids fort)
    "large language model": 5, "llm": 5, "gpt": 4, "transformer": 4,
    "diffusion model": 4, "reinforcement learning": 4, "neural network": 3,
    "deep learning": 4, "machine learning": 3, "artificial intelligence": 4,
    "generative ai": 5, "foundation model": 5, "fine-tuning": 4,
    "rlhf": 5, "chain of thought": 4, "rag": 4, "retrieval augmented": 4,
    "multimodal": 3, "embedding": 3, "attention mechanism": 4,
    "agent": 2, "ai safety": 5, "alignment": 4, "hallucination": 3,
    "prompt engineering": 3, "inference": 2, "training": 2,
    # Outils / frameworks
    "hugging face": 3, "pytorch": 3, "tensorflow": 2, "langchain": 4,
    "llamaindex": 4, "ollama": 3, "vllm": 4, "gguf": 3,
    # Modèles spécifiques
    "claude": 4, "gemini": 4, "llama": 3, "mistral": 3, "gemma": 3,
    "qwen": 3, "deepseek": 4, "grok": 3,
}

# Seuils
DEFAULT_MIN_SCORE = 3
DEFAULT_MAX_ARTICLES = 50
RSS_TIMEOUT = 15  # secondes


# ─── Modèle de données ───────────────────────────────────────────────────────

@dataclass
class Article:
    title: str
    link: str
    source_name: str
    source_category: str
    source_base_score: int  # score de la source (1-5)
    published: str
    auto_score: int  # score automatique basé sur les mots-clés (1-5)
    final_score: float  # combinaison des deux scores
    matched_keywords: list


# ─── HTML Stripper ───────────────────────────────────────────────────────────

class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.fed = []

    def handle_data(self, d):
        self.fed.append(d)

    def get_data(self):
        return ''.join(self.fed)


def strip_html(html: str) -> str:
    s = HTMLStripper()
    s.feed(html)
    return s.get_data()


# ─── Parsing sources-rss.md ──────────────────────────────────────────────────

def parse_sources_md(md_path: Path) -> list[dict]:
    """Extrait les sources du fichier markdown."""
    content = md_path.read_text(encoding="utf-8")
    sources = []

    current_category = "Inconnue"

    for line in content.split("\n"):
        # Détection des catégories (## headers)
        if line.startswith("## "):
            # Extraire le nom de catégorie (après l'emoji)
            cat_match = re.search(r"## .+?([A-ZÀ-Ÿ].+)", line)
            if cat_match:
                current_category = cat_match.group(1).strip()
            continue

        # Détection des lignes de tableau (| # | Nom | URL | ...)
        if not line.startswith("|") or "---" in line or "URL RSS" in line:
            continue

        parts = [p.strip() for p in line.split("|")[1:-1]]
        if len(parts) < 5:
            continue

        try:
            num = int(parts[0])
        except ValueError:
            continue

        name = parts[1]
        url = parts[2]
        lang = parts[3]
        freq = parts[4]
        stars = parts[5] if len(parts) > 5 else ""
        score = stars.count("★")

        sources.append({
            "num": num,
            "name": name,
            "rss_url": url,
            "category": current_category,
            "lang": lang,
            "frequency": freq,
            "base_score": score,
        })

    return sources


# ─── Fetch RSS ───────────────────────────────────────────────────────────────

def fetch_rss(url: str, timeout: int = RSS_TIMEOUT) -> Optional[str]:
    """Récupère le contenu XML d'un flux RSS."""
    headers = {
        "User-Agent": "CGIWebContent-RSSBot/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml",
    }
    req = Request(url, headers=headers)
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (URLError, Exception) as e:
        print(f"  ⚠ Erreur fetch {url}: {e}", file=sys.stderr)
        return None


def parse_rss_items(xml_text: str, limit: int = 20) -> list[dict]:
    """Parse les items d'un flux RSS/Atom."""
    items = []

    # Gestion des namespaces courants
    namespaces = {
        "dc": "http://purl.org/dc/elements/1.1/",
        "content": "http://purl.org/rss/1.0/modules/content/",
        "atom": "http://www.w3.org/2005/Atom",
    }

    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError as e:
        print(f"  ⚠ XML parse error: {e}", file=sys.stderr)
        return []

    # RSS 2.0
    for item in root.iter("item"):
        if len(items) >= limit:
            break
        title = item.findtext("title", "").strip()
        link = item.findtext("link", "").strip()
        pub_date = item.findtext("pubDate", "").strip()
        desc = item.findtext("description", "").strip()

        # Essayer content:encoded pour plus de contexte
        content_el = item.find("content:encoded", namespaces)
        if content_el is not None and content_el.text:
            desc = content_el.text

        items.append({
            "title": title,
            "link": link,
            "published": pub_date,
            "description": strip_html(desc)[:500],
        })

    # Atom
    if not items:
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.findall(".//atom:entry", ns):
            if len(items) >= limit:
                break
            title = entry.findtext("atom:title", "", ns).strip()
            link_el = entry.find("atom:link", ns)
            link = link_el.get("href", "") if link_el is not None else ""
            pub_date = entry.findtext("atom:published", entry.findtext("atom:updated", "", ns), ns).strip()
            summary = entry.findtext("atom:summary", entry.findtext("atom:content", "", ns), ns).strip()

            items.append({
                "title": title,
                "link": link,
                "published": pub_date,
                "description": strip_html(summary)[:500],
            })

    return items


# ─── Scoring ─────────────────────────────────────────────────────────────────

def score_text(text: str) -> tuple[int, list[str]]:
    """Score un texte en fonction des mots-clés IA. Retourne (score 1-5, mots-clés trouvés)."""
    text_lower = text.lower()
    total_weight = 0
    matched = []

    for keyword, weight in AI_KEYWORDS.items():
        if keyword in text_lower:
            total_weight += weight
            matched.append(keyword)

    if not matched:
        return 1, []

    # Normaliser en score 1-5
    if total_weight >= 15:
        auto_score = 5
    elif total_weight >= 10:
        auto_score = 4
    elif total_weight >= 6:
        auto_score = 3
    elif total_weight >= 3:
        auto_score = 2
    else:
        auto_score = 1

    return auto_score, matched


def compute_final_score(source_base: int, auto_score: int) -> float:
    """Combine le score de la source et le score automatique."""
    # Pondération : 40% score source, 60% score automatique
    return round(source_base * 0.4 + auto_score * 0.6, 2)


# ─── Pipeline principal ──────────────────────────────────────────────────────

def run_pipeline(
    sources_md: Path,
    min_score: float = DEFAULT_MIN_SCORE,
    max_articles: int = DEFAULT_MAX_ARTICLES,
    output_path: Optional[Path] = None,
) -> list[dict]:
    """Exécute le pipeline complet de scoring."""

    print("📖 Lecture des sources depuis sources-rss.md...")
    sources = parse_sources_md(sources_md)
    print(f"   → {len(sources)} sources trouvées\n")

    all_articles: list[Article] = []

    for i, src in enumerate(sources, 1):
        print(f"[{i}/{len(sources)}] 🔍 {src['name']}...")

        xml_text = fetch_rss(src["rss_url"])
        if not xml_text:
            continue

        items = parse_rss_items(xml_text, limit=15)
        print(f"   → {len(items)} articles récupérés")

        for item in items:
            combined_text = f"{item['title']} {item['description']}"
            auto_score, keywords = score_text(combined_text)
            final = compute_final_score(src["base_score"], auto_score)

            article = Article(
                title=item["title"],
                link=item["link"],
                source_name=src["name"],
                source_category=src["category"],
                source_base_score=src["base_score"],
                published=item["published"],
                auto_score=auto_score,
                final_score=final,
                matched_keywords=keywords,
            )
            all_articles.append(article)

    # Filtrer et trier
    filtered = [a for a in all_articles if a.final_score >= min_score]
    filtered.sort(key=lambda a: a.final_score, reverse=True)
    filtered = filtered[:max_articles]

    print(f"\n✅ {len(filtered)} articles retenus (score ≥ {min_score})")

    # Convertir en dicts JSON-serializables
    result = []
    for a in filtered:
        d = asdict(a)
        result.append(d)

    # Écrire le rapport
    if output_path:
        report = {
            "generated_at": datetime.now().isoformat(),
            "total_sources": len(sources),
            "total_articles_scanned": len(all_articles),
            "articles_retained": len(filtered),
            "min_score_filter": min_score,
            "articles": result,
        }
        output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"📄 Rapport écrit dans {output_path}")

    return result


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Score et filtre les articles RSS sur l'IA"
    )
    parser.add_argument(
        "--sources",
        type=Path,
        default=Path(__file__).parent.parent / "docs" / "sources-rss.md",
        help="Chemin vers sources-rss.md",
    )
    parser.add_argument(
        "--min-score",
        type=float,
        default=DEFAULT_MIN_SCORE,
        help=f"Score minimum pour retenir un article (défaut: {DEFAULT_MIN_SCORE})",
    )
    parser.add_argument(
        "--max-articles",
        type=int,
        default=DEFAULT_MAX_ARTICLES,
        help=f"Nombre max d'articles à retenir (défaut: {DEFAULT_MAX_ARTICLES})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent.parent / "docs" / "report.json",
        help="Chemin de sortie du rapport JSON",
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Afficher les sources sans fetch",
    )

    args = parser.parse_args()

    if args.list_only:
        sources = parse_sources_md(args.sources)
        for s in sources:
            print(f"{'★' * s['base_score']} [{s['category']}] {s['name']}")
        return

    run_pipeline(
        sources_md=args.sources,
        min_score=args.min_score,
        max_articles=args.max_articles,
        output_path=args.output,
    )


if __name__ == "__main__":
    main()
