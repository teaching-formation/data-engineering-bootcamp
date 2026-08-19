# 📨 Streaming & Kafka

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

## 16. Batch, micro-batch, streaming : quelles différences, et comment tu choisis ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Batch, micro-batch, streaming: what's the difference and how do you choose?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Le batch traite les données par lots à intervalles réguliers (toutes les heures, toutes les nuits). Le streaming les traite au fil de l'eau, dès qu'elles arrivent.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Trois modèles, avec des latences très différentes :

| Modèle | Latence typique | Outils |
|---|---|---|
| **Batch** | minutes à heures | Spark, dbt, Airflow |
| **Micro-batch** | secondes | Spark Structured Streaming |
| **Streaming événementiel** | millisecondes | Flink, Kafka Streams |

Le micro-batch est un compromis intéressant : Spark découpe le flux en petits lots (par exemple toutes les 10 secondes) et le modèle de programmation reste **identique au batch** — même API, même code, ce qui réduit énormément le coût d'apprentissage et de maintenance.

Le choix se fait sur la latence réellement exigée par le métier, pas sur la mode.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

En entretien comme en projet, je ne demande jamais « voulez-vous du temps réel ? » — la réponse est toujours oui. Je demande : **« que faites-vous différemment si la donnée arrive en 5 secondes plutôt qu'en 15 minutes ? »**. Dans la grande majorité des cas, la réponse honnête est « rien » : le rapport est lu le matin, la décision se prend en réunion hebdomadaire. Et alors le batch est objectivement meilleur — plus simple, moins cher, rejouable, testable, débogable à froid.

Le streaming a un coût opérationnel que les candidats sous-estiment : de l'état à gérer et à faire vieillir, des checkpoints à ne pas corrompre, des montées de version délicates (un changement de schéma d'état peut rendre le checkpoint illisible), un débogage sur un job qui tourne en continu, et une astreinte — un pipeline batch qui échoue à 3 h peut attendre 8 h ; un pipeline de détection de fraude, non.

Les cas où le streaming se justifie vraiment : détection de fraude, alerting opérationnel, tarification dynamique, supervision technique, et les usages où la donnée perd sa valeur en quelques secondes. En mobile money par exemple, bloquer une transaction frauduleuse doit se faire pendant la transaction — là, c'est légitime.

Deux nuances qui font la différence. D'abord, ne pas confondre **latence** et **fraîcheur perçue** : un pipeline « temps réel » qui alimente un dashboard rafraîchi toutes les 15 minutes ne sert à rien — on a payé la complexité sans acheter de valeur. Ensuite, la migration batch → streaming est bien plus facile dans ce sens que l'inverse : commencer en batch, mesurer, et ne passer au streaming que sur le périmètre qui le justifie, est presque toujours la bonne trajectoire.

</details>

> ⚠️ **Le piège** — Vendre le streaming comme intrinsèquement supérieur. Un bon Data Engineer se distingue par sa capacité à **ne pas** utiliser la technologie la plus impressionnante.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
>
> 🇬🇧 *micro-batch, end-to-end latency, operational overhead, event-driven*

---

## 17. Explique topics, partitions et consumer groups dans Kafka. Comment garantir l'ordre des messages ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Explain Kafka topics, partitions and consumer groups. How do you guarantee message ordering?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Un **topic** est un canal de messages, découpé en **partitions**. Les consommateurs d'un même **consumer group** se répartissent les partitions pour lire en parallèle.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

La partition est à la fois l'unité de **parallélisme** et l'unité d'**ordre**. Kafka garantit l'ordre **à l'intérieur** d'une partition, jamais entre partitions.

Le placement se fait par la **clé** du message : `partition = hash(clé) % nb_partitions`. Tous les messages portant la même clé (par exemple un `customer_id`) atterrissent donc dans la même partition et sont ordonnés entre eux. Sans clé, la répartition est round-robin : bonne distribution, aucune garantie d'ordre.

Dans un consumer group, chaque partition est assignée à **exactement un** consommateur. Conséquence directe : ajouter plus de consommateurs que de partitions ne sert à rien, les consommateurs excédentaires restent inactifs.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le **choix de la clé** est la décision structurante, et elle est difficile à revenir en arrière. Une clé trop grossière crée une *hot partition* — c'est exactement le problème de skew de la question 13, transposé à Kafka : un consommateur saturé pendant que les autres dorment.

Le **nombre de partitions** est encore plus engageant. On peut l'augmenter, mais cela casse le mapping `clé → partition` : les nouveaux messages d'une clé donnée partiront ailleurs, et l'ordre historique par clé est rompu. D'où la règle de sur-provisionner raisonnablement au départ. Mais sur-provisionner à l'excès coûte aussi : plus de descripteurs de fichiers et de mémoire sur les brokers, réplication plus lourde, et rééquilibrages plus longs.

En production, le vrai point douloureux est le **rebalancing** : quand un consommateur rejoint ou quitte le groupe, l'assignation est recalculée et, avec la stratégie classique, tout le groupe s'arrête le temps de la redistribution. Deux conséquences pratiques : utiliser une stratégie coopérative (`CooperativeStickyAssignor`) pour éviter le *stop-the-world*, et surveiller `max.poll.interval.ms` — si le traitement d'un lot dépasse ce délai, le broker considère le consommateur mort, déclenche un rebalancing, le consommateur revient, reprend le même lot, et repart pour un tour. On obtient une boucle infinie qui ressemble à un problème de performance alors que c'est un problème de configuration.

Enfin, sur l'ordre total : il n'existe qu'avec **une seule partition**, ce qui supprime tout parallélisme. Quand un métier exige un ordre global strict, c'est presque toujours le signe d'une modélisation à revoir : l'ordre **par entité** (par compte, par client) suffit dans la quasi-totalité des cas réels, et il est gratuit dès qu'on choisit bien la clé.

</details>

> ⚠️ **Le piège** — Affirmer « Kafka garantit l'ordre ». Il le garantit **par partition**. Cette nuance est exactement ce que la question teste.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [29 · Messaging distribué](/modules/advanced__29_distributed_messaging/)
>
> 🇬🇧 *partition key, consumer group, rebalancing, hot partition, ordering guarantee*

---

## 18. At-least-once, at-most-once, exactly-once : que choisis-tu, et à quel coût ?

`fréquente` · `🌍 international` · **EN** — *At-least-once, at-most-once, exactly-once — which do you choose, and at what cost?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

**At-most-once** : le message peut être perdu. **At-least-once** : il peut être traité plusieurs fois (doublons). **Exactly-once** : exactement une fois, c'est le plus fiable.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

En pratique, tout se joue sur le **moment du commit de l'offset** :

- Commit **avant** traitement → at-most-once. Si le consommateur tombe après le commit, le message est perdu.
- Commit **après** traitement → at-least-once. Si le consommateur tombe entre le traitement et le commit, le message sera relu au redémarrage : doublon.

L'exactly-once dans Kafka repose sur les **transactions** : producteur idempotent (`enable.idempotence`), `transactional.id`, et écriture atomique du résultat **et** de l'offset. Côté lecteur, il faut `isolation.level=read_committed`. Le prix : débit réduit, latence supplémentaire, complexité de reprise.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma réponse en entretien est nette : **at-least-once + traitement idempotent**. C'est le design de la grande majorité des systèmes fiables, et ce n'est pas un compromis au rabais — c'est plus simple, plus robuste et plus facile à opérer que l'exactly-once.

La raison de fond est importante à savoir formuler : l'exactly-once « de bout en bout » est largement un argument commercial. Il est réel **à l'intérieur du périmètre Kafka** (Kafka → traitement → Kafka), parce que les offsets et les écritures peuvent participer à la même transaction. Dès que la destination est un système externe — une API, une base sans transaction partagée, un envoi de SMS — l'atomicité est impossible : il y aura toujours une fenêtre entre « j'ai écrit » et « j'ai commité ». La seule vraie protection est de rendre l'**écriture cible idempotente** : `MERGE` sur une clé métier, `upsert`, `ON CONFLICT DO NOTHING`. C'est ce qui rend le pattern `MERGE INTO` du lakehouse si central.

Le coût de l'exactly-once mérite d'être chiffré quand on le propose : baisse de débit, latence accrue (les consommateurs en `read_committed` attendent la fin des transactions), et surtout une reprise après incident plus délicate. Je le réserve aux cas où un doublon a un **coût métier réel** : facturation, paiement, mouvement comptable. En banque et en mobile money, ce sont des cas légitimes — et là, la conversation se tient avec le métier et la conformité, pas entre ingénieurs.

À l'inverse, l'at-most-once a de vrais usages qu'on oublie : télémétrie, métriques d'usage, logs d'observabilité. Perdre 0,1 % des points n'a aucun impact sur une courbe, et on gagne en latence et en simplicité. Choisir la garantie la plus faible **suffisante** est un signe de maturité, pas de négligence.

</details>

> ⚠️ **Le piège** — Répondre « exactly-once, évidemment ». Le recruteur attend que tu connaisses son coût et sa **limite** dès qu'un système externe entre en jeu.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *delivery semantics, offset commit, idempotent producer, transactional write, read_committed*

---

## 19. C'est quoi un watermark ? Comment tu gères les données qui arrivent en retard ?

`fréquente` · `🌍 international` · **EN** — *What is a watermark, and how do you handle late-arriving data?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Le watermark définit jusqu'à quel point on accepte les données en retard. Au-delà de ce seuil, les événements trop anciens sont ignorés.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Tout part de la distinction entre **event time** (le moment où l'événement s'est produit) et **processing time** (le moment où on le traite). Sur un réseau instable, l'écart peut être considérable.

Quand on agrège par fenêtres (le chiffre d'affaires par tranche de 5 minutes), il faut décider **quand une fenêtre est close**. Le watermark est ce seuil : « je considère ne plus recevoir d'événement plus ancien que `(max event time observé − 10 minutes)` ». Passé ce point, la fenêtre est finalisée, son état est libéré, et les arrivées plus tardives sont rejetées.

```python
(df.withWatermark("event_time", "10 minutes")
   .groupBy(F.window("event_time", "5 minutes"), "country")
   .agg(F.sum("amount")))
```

Sans watermark, l'état grossit indéfiniment : le job finit par tomber en mémoire.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le watermark est un **arbitrage explicite entre exactitude, latence et mémoire**, et ce n'est pas une décision technique : c'est une décision métier. Un watermark de deux heures capte presque tout mais retarde les résultats et conserve beaucoup d'état (mémoire, checkpoints plus lourds, reprise plus lente). Un watermark d'une minute donne des résultats immédiats mais jette des données. La bonne façon de poser la question au métier : *« acceptez-vous que 0,3 % des transactions ne soient pas comptées dans l'agrégat pour gagner une heure de fraîcheur ? »*.

En production, le point non négociable est de **mesurer**. Je pose systématiquement deux métriques : la distribution de l'écart `processing_time − event_time`, et un compteur d'événements rejetés par le watermark. Sans cela, on perd de la donnée **silencieusement** — le pire scénario possible, parce que rien n'échoue et que les chiffres sont simplement faux.

Un piège que j'ai vu casser un pipeline : le watermark avance avec le **maximum** d'event time observé. Il suffit donc d'**un seul** message avec un horodatage aberrant dans le futur — une horloge mal réglée sur un terminal de terrain — pour que le watermark saute de plusieurs jours et invalide d'un coup toutes les données réelles qui suivent. D'où un filtre de sanité rejetant les timestamps trop en avance, avant toute agrégation.

Le contexte compte énormément pour calibrer. Sur des terminaux de paiement en zone à réseau instable, des événements peuvent remonter avec plusieurs heures de retard quand la connectivité revient : un watermark dimensionné pour une infrastructure européenne y détruirait une part significative des données.

Enfin, pour les vrais retardataires, la réponse n'est pas d'allonger indéfiniment le watermark mais d'assumer une **architecture lambda** : le streaming fournit une réponse rapide et approximative, et un batch de réconciliation nocturne recalcule la vérité. On sépare ainsi la contrainte de fraîcheur de la contrainte d'exactitude au lieu de les faire porter par un seul mécanisme.

</details>

> ⚠️ **Le piège** — Présenter le watermark comme un simple paramètre. C'est un arbitrage métier, et sans métrique sur les événements rejetés, on perd des données sans le savoir.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [33 · OLAP temps réel](/modules/advanced__33_realtime_olap_dashboards/)
>
> 🇬🇧 *event time vs processing time, watermark, windowing, late-arriving data, state store, lambda architecture*

---

## 20. Comment rends-tu un consommateur Kafka idempotent ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you make a Kafka consumer idempotent?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Avant d'insérer un message, on vérifie s'il a déjà été traité, par exemple grâce à son identifiant, pour ne pas créer de doublon.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Être idempotent, c'est garantir que traiter deux fois le même message donne le **même état final**. Trois approches :

1. **Upsert sur une clé métier** : `MERGE INTO` (lakehouse), `ON CONFLICT DO NOTHING/UPDATE` (PostgreSQL). Un rejeu écrase la ligne au lieu d'en créer une seconde.
2. **Table de déduplication** des identifiants déjà traités, consultée avant traitement.
3. **Opérations naturellement idempotentes** : préférer un `SET solde = 1500` à un `INCREMENT solde + 100`, qui n'est pas rejouable.

C'est ce qui permet de fonctionner sereinement en at-least-once (question 18) sans payer le coût de l'exactly-once.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La vraie question est : **quelle est la clé d'idempotence, et d'où vient-elle ?** Elle doit être fournie par le **producteur** et être stable dans le temps. Un offset Kafka ne convient pas (il change si le message est republié), un horodatage de réception non plus. Il faut un identifiant métier : `transaction_id`, `payment_id`.

Si la source n'en fournit pas, on peut hasher un ensemble de champs — mais il faut alors énoncer clairement le risque : deux événements **légitimement identiques** (le même client achète deux fois 500 F à la même seconde, ce qui arrive réellement en mobile money) seront fusionnés à tort. C'est une perte de données, et c'est une décision à faire valider par le métier, pas un choix d'implémentation.

Sur le stockage de l'état de déduplication, le piège classique est la table qui grossit indéfiniment jusqu'à devenir plus coûteuse que le traitement lui-même. Il faut une **fenêtre de rétention** explicite (par exemple 7 jours), cohérente avec la rétention Kafka et avec le délai maximal de rejeu qu'on s'autorise. Au-delà, on assume de ne plus dédupliquer.

Le point le plus souvent manqué : l'idempotence en base ne protège pas des **effets de bord externes**. Si le traitement envoie un SMS, débite un compte via une API ou publie sur un autre topic, rejouer n'est pas neutre — le client reçoit deux SMS, ou est débité deux fois. La parade est une **clé d'idempotence côté API** : la plupart des API de paiement sérieuses acceptent un en-tête `Idempotency-Key` prévu exactement pour ça. Quand ce n'est pas disponible, on isole l'effet de bord derrière une table d'état transactionnelle (*outbox pattern*).

Enfin, l'idempotence doit être **testée**, pas supposée : dans ma CI, rejouer deux fois le même lot doit produire un état final identique. C'est le test dont je parlais à la question 8, et c'est celui qui rattrape le plus de bugs avant la production.

</details>

> ⚠️ **Le piège** — Ne parler que de la base de données. Un rejeu qui renvoie un SMS ou redébite un compte est le vrai risque, et il ne se règle pas avec un `MERGE`.
>
> 📘 **Pour approfondir** : [24 · Kafka & streaming](/modules/intermediate__24_kafka_streaming/) · [23 · Delta & Iceberg](/modules/intermediate__23_table_formats_delta_iceberg/)
>
> 🇬🇧 *idempotency key, upsert, deduplication window, side effects, outbox pattern*


---

← **Thème précédent** : [⚡ Spark & calcul distribué](/entretien-spark/)

📋 [**Tous les thèmes**](/entretien-questions/)
