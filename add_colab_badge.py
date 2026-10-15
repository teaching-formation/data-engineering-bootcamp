#!/usr/bin/env python3
"""
Script pour ajouter ou supprimer les badges "Open in Colab" des notebooks du bootcamp.

Usage:
    python add_colab_badge.py          # Ajouter les badges
    python add_colab_badge.py --add    # Ajouter les badges (explicite)
    python add_colab_badge.py --remove # Supprimer tous les badges
    python add_colab_badge.py -r       # Supprimer tous les badges (raccourci)
"""

import json
import os
import argparse
from pathlib import Path

# Configuration
GITHUB_USER = "diakite-data"
GITHUB_REPO = "data-engineering-bootcamp"
GITHUB_BRANCH = "main"

# Notebooks qui NE PEUVENT PAS tourner sur Colab (Docker, K8s, etc.)
EXCLUDE_NOTEBOOKS = [
    "14_docker",
    "15_kubernetes",
    "16_k8s",
    "21_spark_on_kubernetes",
    "ateliers/",  # les ateliers se font en local, sans Colab
]

def should_exclude(notebook_path: str) -> bool:
    """Vérifie si le notebook doit être exclu (Docker, K8s, etc.)"""
    for pattern in EXCLUDE_NOTEBOOKS:
        if pattern in notebook_path:
            return True
    return False

def create_colab_badge_cell(notebook_rel_path: str) -> dict:
    """Crée une cellule markdown avec le badge Colab"""
    colab_url = f"https://colab.research.google.com/github/{GITHUB_USER}/{GITHUB_REPO}/blob/{GITHUB_BRANCH}/{notebook_rel_path}"
    
    badge_markdown = f"""<a href="{colab_url}" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

> 💡 **Conseil** : Cliquez sur le badge ci-dessus pour exécuter ce notebook directement dans Google Colab (aucune installation requise)."""

    return {
        "cell_type": "markdown",
        "metadata": {
            "id": "colab-badge"
        },
        "source": badge_markdown.split('\n')
    }

def has_colab_badge(notebook: dict) -> bool:
    """Vérifie si le notebook a déjà un badge Colab"""
    if not notebook.get("cells"):
        return False
    
    for cell in notebook["cells"][:5]:  # Vérifie les 5 premières cellules
        if cell.get("cell_type") == "markdown":
            source = "".join(cell.get("source", []))
            if "colab-badge.svg" in source or "Open In Colab" in source:
                return True
    return False

def find_colab_badge_indices(notebook: dict) -> list:
    """Trouve les indices de toutes les cellules contenant un badge Colab"""
    indices = []
    
    for i, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") == "markdown":
            source = "".join(cell.get("source", []))
            if "colab-badge.svg" in source or "Open In Colab" in source:
                indices.append(i)
    
    return indices

def add_colab_badge_to_notebook(notebook_path: Path, repo_root: Path) -> bool:
    """Ajoute le badge Colab à un notebook"""
    
    # Chemin relatif depuis la racine du repo
    rel_path = notebook_path.relative_to(repo_root)
    
    # Vérifier si on doit exclure ce notebook
    if should_exclude(str(notebook_path)):
        print(f"  ⏭️  Exclu (Docker/K8s) : {rel_path}")
        return False
    
    # Lire le notebook
    with open(notebook_path, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    
    # Vérifier si le badge existe déjà
    if has_colab_badge(notebook):
        print(f"  ✓  Badge déjà présent : {rel_path}")
        return False
    
    # Créer la cellule badge
    badge_cell = create_colab_badge_cell(str(rel_path))
    
    # Insérer au début (après le titre s'il existe)
    insert_position = 0
    
    # Si la première cellule est un titre (# xxx), insérer après
    if notebook.get("cells") and notebook["cells"][0].get("cell_type") == "markdown":
        first_source = "".join(notebook["cells"][0].get("source", []))
        if first_source.strip().startswith("#"):
            insert_position = 1
    
    notebook["cells"].insert(insert_position, badge_cell)
    
    # Sauvegarder
    with open(notebook_path, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)
    
    print(f"  ✅ Badge ajouté : {rel_path}")
    return True

def remove_colab_badge_from_notebook(notebook_path: Path, repo_root: Path) -> bool:
    """Supprime le(s) badge(s) Colab d'un notebook"""
    
    # Chemin relatif depuis la racine du repo
    rel_path = notebook_path.relative_to(repo_root)
    
    # Lire le notebook
    with open(notebook_path, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    
    # Trouver les cellules avec badge
    badge_indices = find_colab_badge_indices(notebook)
    
    if not badge_indices:
        print(f"  ✓  Pas de badge : {rel_path}")
        return False
    
    # Supprimer les cellules (en commençant par la fin pour ne pas décaler les indices)
    for idx in reversed(badge_indices):
        del notebook["cells"][idx]
    
    # Sauvegarder
    with open(notebook_path, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1, ensure_ascii=False)
    
    print(f"  🗑️  Badge supprimé ({len(badge_indices)} cellule(s)) : {rel_path}")
    return True

def main():
    # Parser les arguments
    parser = argparse.ArgumentParser(
        description="Ajouter ou supprimer les badges Colab des notebooks",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python add_colab_badge.py          # Ajouter les badges
  python add_colab_badge.py --add    # Ajouter les badges (explicite)
  python add_colab_badge.py --remove # Supprimer tous les badges
  python add_colab_badge.py -r       # Supprimer tous les badges (raccourci)
        """
    )
    
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        '--add', '-a',
        action='store_true',
        default=True,
        help='Ajouter les badges Colab (par défaut)'
    )
    group.add_argument(
        '--remove', '-r',
        action='store_true',
        help='Supprimer tous les badges Colab'
    )
    
    args = parser.parse_args()
    
    # Déterminer le mode
    mode = "remove" if args.remove else "add"
    
    # Trouver la racine du repo
    script_dir = Path(__file__).parent
    repo_root = script_dir
    
    # Chercher le dossier notebooks
    notebooks_dir = repo_root / "notebooks"
    
    if not notebooks_dir.exists():
        print(f"❌ Dossier notebooks/ non trouvé dans {repo_root}")
        return
    
    if mode == "add":
        print(f"🔍 Ajout des badges Colab dans {notebooks_dir}\n")
    else:
        print(f"🗑️  Suppression des badges Colab dans {notebooks_dir}\n")
    
    # Trouver tous les notebooks
    notebooks = list(notebooks_dir.rglob("*.ipynb"))
    
    # Filtrer les checkpoints
    notebooks = [nb for nb in notebooks if ".ipynb_checkpoints" not in str(nb)]
    
    print(f"📓 {len(notebooks)} notebooks trouvés\n")
    
    modified = 0
    skipped = 0
    excluded = 0
    
    for level in ["beginner", "intermediate", "advanced"]:
        level_notebooks = [nb for nb in notebooks if f"/{level}/" in str(nb)]
        
        if level_notebooks:
            print(f"\n📁 {level.upper()}:")
            for nb_path in sorted(level_notebooks):
                if mode == "add":
                    if should_exclude(str(nb_path)):
                        excluded += 1
                    elif add_colab_badge_to_notebook(nb_path, repo_root):
                        modified += 1
                    else:
                        skipped += 1
                else:  # remove
                    if remove_colab_badge_from_notebook(nb_path, repo_root):
                        modified += 1
                    else:
                        skipped += 1
    
    print(f"\n" + "="*50)
    
    if mode == "add":
        print(f"✅ Badges ajoutés : {modified}")
        print(f"⏭️  Déjà présents : {skipped}")
        print(f"🚫 Exclus (Docker/K8s) : {excluded}")
    else:
        print(f"🗑️  Badges supprimés : {modified}")
        print(f"⏭️  Sans badge : {skipped}")
    
    print(f"="*50)
    
    if modified > 0:
        print(f"\n💡 N'oublie pas de commit :")
        print(f"   git add notebooks/")
        if mode == "add":
            print(f"   git commit -m 'Add Colab badges to notebooks'")
        else:
            print(f"   git commit -m 'Remove Colab badges from notebooks'")
        print(f"   git push")

if __name__ == "__main__":
    main()