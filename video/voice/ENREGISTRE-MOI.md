# 🎙️ Échantillon de voix — à enregistrer

Lis le texte ci-dessous **à voix haute**, puis dépose le fichier audio dans ce dossier
sous le nom **`sample.wav`** (ou `sample.mp3`).

## Comment enregistrer (le plus important)

| Critère | Pourquoi |
|---|---|
| **Pièce silencieuse**, sans écho | Le modèle clone *tout* ce qu'il entend, y compris le bruit de fond et la réverbération |
| **Micro à 15-20 cm**, pas collé | Évite les plosives (« p », « b ») qui saturent |
| **Ton naturel**, comme si tu expliquais à un collègue | Si tu lis de façon monotone, la voix clonée sera monotone |
| **1 à 2 minutes** suffisent | Au-delà, le gain est marginal |
| **Pas de musique, pas de montage** | Brut, non traité |

> 💡 Sur Mac : l'app **Dictaphone** (Voice Memos) fait très bien l'affaire. Exporte ensuite en `.wav` si possible — sinon le `.m4a` se convertit sans problème.

---

## Le texte à lire

> Lis-le d'un trait, sans chercher la perfection. Les hésitations naturelles ne gênent pas.
> Ce texte est volontairement rempli de **vocabulaire technique** : c'est exactement ce que
> le modèle devra savoir prononcer dans les vidéos.

---

Bonjour, je m'appelle Mamadou Youssouf Diakité, et je conçois des parcours de formation en Data Engineering.

Dans cette série, on va parler de pipelines de données, et surtout de ce qui les casse en production.

Prenons un exemple concret. Tu as une table de transactions bancaires, et tu découvres des doublons. Le réflexe, c'est d'écrire un SELECT DISTINCT. Mais ça ne répond pas vraiment à la question : quelle ligne faut-il garder ?

La bonne réponse passe par une fonction de fenêtrage. Tu numérotes les lignes avec ROW_NUMBER, tu partitionnes par la clé métier, tu ordonnes par la date décroissante, et tu ne conserves que la première.

Maintenant, la vraie question que se pose un ingénieur expérimenté : d'où viennent ces doublons ? Parce que dédupliquer, c'est souvent traiter le symptôme. Si l'origine est un rejeu de pipeline, le correctif n'est pas en aval : il faut rendre l'ingestion idempotente.

On parlera aussi de partitionnement, de shuffle, d'architecture médaillon, de Delta Lake et d'Apache Iceberg. De Kafka, de watermark, et de données qui arrivent en retard.

Et surtout, on parlera des arbitrages. Parce qu'en Data Engineering, la bonne réponse commence presque toujours par : ça dépend.

Merci de m'avoir écouté, et à très vite.

---

## Une fois enregistré

Dépose le fichier ici :

```
video/voice/sample.wav
```

Et dis-le-moi — je lance le clonage et la génération de la première voix de test.

> ⚠️ Ce fichier **n'est pas versionné** dans Git (voir `.gitignore`) : ta voix reste sur ta machine.
