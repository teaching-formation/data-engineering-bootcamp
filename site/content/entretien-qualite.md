# ✅ Data Quality & gouvernance

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

---

## 31. Comment définis-tu la qualité d'une donnée ? Quelles dimensions ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you define data quality? What dimensions do you measure?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Une donnée de qualité est complète, sans doublons, à jour et correcte.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

On raisonne en **dimensions mesurables**, chacune traduisible en test automatique :

| Dimension | Question posée | Test |
|---|---|---|
| Complétude | manque-t-il des valeurs ? | `not_null` |
| Unicité | y a-t-il des doublons ? | `unique` |
| Validité | la valeur est-elle dans le domaine attendu ? | `accepted_values`, bornes |
| Cohérence | les systèmes disent-ils la même chose ? | réconciliation |
| Fraîcheur | la table est-elle à jour ? | `freshness` |
| Exactitude | la valeur correspond-elle au réel ? | rapprochement externe |

Un montant négatif relève de la validité ; un chiffre d'affaires qui ne correspond pas à la comptabilité relève de l'exactitude — ce ne sont pas les mêmes contrôles.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La dimension qu'on oublie et qui cause le plus de dégâts, c'est la **fraîcheur** — parce que c'est la seule qui échoue **sans erreur**. Toutes les autres se vérifient en regardant la donnée présente ; la fraîcheur exige de détecter une *absence*. Un pipeline en pause depuis trois jours ne lève aucune exception : les tableaux de bord affichent simplement d'anciens chiffres, et personne ne s'en aperçoit avant qu'une décision soit prise dessus.

L'**exactitude** est de loin la plus difficile, et c'est important de savoir le dire : on ne peut pas la tester en vase clos. Vérifier qu'un chiffre est *vrai* suppose une source de vérité externe — la comptabilité, le système source, un relevé. C'est pour ça que la **réconciliation** est un sujet à part entière en banque, et qu'aucun test dbt ne la remplace.

Sur la méthode, mon principe est contre-intuitif : **on ne teste pas tout**. Générer 400 tests sur toutes les colonnes produit du bruit, des faux positifs, et au bout de trois semaines plus personne ne regarde les alertes — on a dégradé la qualité en croyant l'améliorer. Je pars des **usages critiques** (quels chiffres partent en comité de direction ? quel modèle décide d'un octroi de crédit ?) et je remonte aux colonnes qui les alimentent. Vingt tests bien choisis valent mieux que quatre cents générés.

Enfin, une limite qu'il faut assumer devant un recruteur : **la qualité n'est pas qu'un problème technique**. Si la donnée est saisie à la main dans une agence sans contrôle applicatif, aucun test en aval n'y changera rien — il produira juste une alerte quotidienne qu'on finira par ignorer. Le vrai correctif est en amont : validation dans l'application, formation des équipes, parfois refonte d'un formulaire. Savoir dire ça évite de promettre ce qu'on ne peut pas tenir.

</details>

> ⚠️ **Le piège** — Réciter les six dimensions sans hiérarchiser. Le recruteur veut voir que tu sais **choisir** quoi tester, pas que tu connais une liste.
>
> 📘 **Pour approfondir** : [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) · [32 · Data Mesh & contracts](/modules/advanced__32_data_mesh_contracts/)
>
> 🇬🇧 *completeness, uniqueness, validity, consistency, freshness, accuracy, reconciliation, alert fatigue*

---

## 32. Une donnée est fausse en production depuis trois jours. Que fais-tu ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *A dataset has been wrong in production for three days. What do you do?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je corrige le bug, je relance le pipeline sur la période concernée et je préviens les utilisateurs.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Dans l'ordre :

1. **Mesurer l'ampleur** — quelles tables, quelles dates, quels consommateurs en aval ?
2. **Communiquer immédiatement** — mieux vaut prévenir que laisser quelqu'un décider sur des chiffres faux.
3. **Corriger la cause**, pas seulement le symptôme.
4. **Backfill** des périodes affectées, en cascade sur les modèles aval (voir question 27).
5. **Post-mortem** et test de non-régression pour que ça ne se reproduise pas.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

L'ordre compte, et le premier réflexe n'est **pas** de corriger : c'est de **contenir**. Si la donnée alimente une décision — un tableau de bord de direction, un modèle de scoring —, la première action est de la marquer comme non fiable ou de la retirer, avant même d'avoir compris la cause. Une donnée fausse en circulation coûte plus cher qu'une donnée absente : une absence se voit et bloque ; une erreur se propage silencieusement dans des décisions.

La question qui doit venir très tôt, et que beaucoup posent trop tard : **est-ce que quelqu'un a déjà agi sur ces chiffres ?** Si un rapport réglementaire est parti au régulateur, si des clients ont été débités, si des crédits ont été refusés sur un score erroné — on n'est plus dans un incident technique. C'est devenu un sujet métier et conformité, et ce n'est plus moi qui pilote seul. Savoir identifier ce basculement, et le déclencher soi-même sans attendre qu'on vienne le chercher, est probablement le marqueur de séniorité le plus visible sur cette question.

Sur la correction elle-même, une décision structurante : **réécrit-on l'historique ou ajoute-t-on une correction datée ?** En environnement réglementé, réécrire peut être interdit — ce qui a été publié doit rester traçable. Cette décision se prend avec la conformité, pas entre ingénieurs.

Enfin, la vraie question du post-mortem n'est pas « qui a fait l'erreur » mais **« pourquoi ne l'a-t-on su qu'après trois jours ? »**. C'est un défaut de **détection**, pas seulement un bug. Un incident qui se conclut par un simple correctif de code laisse le trou de détection ouvert : la prochaine anomalie mettra encore trois jours à se voir. La sortie d'incident doit être un contrôle de fraîcheur, de volumétrie ou de distribution.

</details>

> ⚠️ **Le piège** — Sauter directement à la correction technique. Contenir et évaluer l'impact métier passent avant, et c'est exactement ce que la question évalue.
>
> 📘 **Pour approfondir** : [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/) · [28 · Orchestration avancée](/modules/advanced__28_advanced_orchestration/)
>
> 🇬🇧 *incident containment, blast radius, downstream impact, restatement, blameless post-mortem, detection gap*

---

## 33. C'est quoi un contrat de données, et à quoi ça sert vraiment ?

`fréquente` · `🌍 international` · **EN** — *What is a data contract, and what problem does it actually solve?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

C'est un accord entre le producteur et le consommateur de la donnée sur le format et la structure de ce qui est échangé.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Un contrat formalise quatre choses :

- le **schéma** — colonnes, types, nullabilité ;
- la **sémantique** — ce que signifie réellement chaque champ ;
- les **garanties** — fréquence de mise à jour, SLA de fraîcheur, volumétrie attendue ;
- la **politique d'évolution** — comment un changement cassant est annoncé.

Versionné dans Git, il devient **testable en CI**. En pratique : les fichiers `.yml` et les *contracts* dbt côté entrepôt, un *schema registry* côté Kafka.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le contrat de données résout un problème **organisationnel**, pas technique. Décrire un schéma n'a jamais été difficile ; le vrai problème est que **l'équipe qui produit la donnée ne subit pas les conséquences quand elle la casse**. Un développeur applicatif renomme un champ dans sa base : il n'a aucune raison de savoir que trois pipelines et un modèle de scoring en dépendent. Le contrat rend cette dépendance visible et opposable.

Mais un contrat ne vaut que s'il est adossé à trois choses. D'abord un **mécanisme qui bloque du côté du producteur** — un test en CI dans *son* dépôt, pas seulement dans le mien : si la vérification est chez le consommateur, on découvre la rupture après coup, ce qui ne change rien. Ensuite une **conversation en amont**, parce qu'un contrat imposé sans discussion est contourné. Enfin une **politique de dépréciation** : on annonce, on maintient les deux versions un temps, puis on retire. Sans ces trois éléments, c'est un document mort dans un wiki.

Erreur classique : vouloir tout contractualiser d'un coup. Je commence par les trois à cinq flux réellement critiques et je laisse le reste en *best effort*. Un contrat a un coût de maintenance ; l'appliquer partout le rend inapplicable partout.

Et la nuance la plus importante, celle qui distingue vraiment : **le contrat protège l'interface, pas la sémantique**. Le schéma peut rester rigoureusement identique pendant que le *sens* change — le champ `statut` gagne une nouvelle valeur possible, ou `montant` passe des euros aux centimes. Aucun test de schéma ne casse, et tous les chiffres deviennent faux. C'est le pire scénario, et c'est pour ça qu'un contrat doit s'accompagner de tests `accepted_values` et de contrôles de distribution.

</details>

> ⚠️ **Le piège** — Présenter le contrat comme un simple fichier de schéma. Sans test bloquant **côté producteur** ni politique de dépréciation, il ne protège de rien.
>
> 📘 **Pour approfondir** : [32 · Data Mesh & contracts](/modules/advanced__32_data_mesh_contracts/) · [25 · dbt & Data Quality](/modules/intermediate__25_dbt_data_quality/)
>
> 🇬🇧 *data contract, schema registry, breaking change, deprecation policy, semantic drift, producer-side validation*

---

## 34. Comment gères-tu les données personnelles dans un pipeline ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you handle personal data in a pipeline?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

On ne collecte que ce qui est nécessaire, on anonymise les données sensibles et on respecte le RGPD.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

D'abord une distinction juridique importante :

- **Anonymisation** — irréversible ; la donnée sort du champ du RGPD.
- **Pseudonymisation** — réversible avec une clé ; la donnée **reste** une donnée personnelle et reste soumise au RGPD.

Les techniques : hachage avec sel, tokenisation, chiffrement, masquage partiel (`FR76 **** **** 1234`), agrégation.

Les principes : **minimisation** (ne collecter que le nécessaire), **limitation de conservation** (durée définie et appliquée), **droit à l'effacement**. Côté technique : chiffrement au repos et en transit, accès par rôle, journalisation des accès.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Trois pièges que je vérifie systématiquement, et qui sont rarement cités.

**1. Croire qu'un hachage anonymise.** Hacher un numéro de téléphone ou un IBAN n'anonymise rien : l'espace des valeurs est petit et énumérable, on retrouve l'original par force brute en quelques minutes. Il faut un **sel secret** — et à ce moment-là on est en pseudonymisation, donc toujours dans le champ du RGPD. Beaucoup d'équipes croient avoir anonymisé et se trompent sur leurs obligations.

**2. La ré-identification par croisement.** On peut supprimer le nom et rester parfaitement identifiable par la combinaison code postal + date de naissance + sexe. C'est un résultat établi : quelques quasi-identifiants suffisent à isoler une personne dans une population. Un vrai anonymat se raisonne en **k-anonymat**, pas en suppression de colonnes.

**3. Le droit à l'effacement dans un lakehouse immuable.** C'est le piège opérationnel par excellence : Bronze est *append-only* et le *time travel* conserve l'historique. Supprimer réellement une personne impose de réécrire les fichiers concernés **et** d'expirer les anciens snapshots — sinon la donnée est toujours là, lisible par time travel. Ça se conçoit dès le départ ; le pattern élégant est le **crypto-shredding** : chiffrer les données d'un utilisateur avec une clé qui lui est propre, et détruire la clé pour rendre la donnée irrécupérable sans réécrire les fichiers.

Un point de contexte utile sur ce marché : **la conformité n'est pas seulement européenne**. Le RGPD ne s'applique pas partout de la même façon, mais des réglementations équivalentes existent — loi ivoirienne sur la protection des données (ARTCI), loi sénégalaise (CDP) — et les régulateurs bancaires régionaux imposent en plus des contraintes de **localisation des données**. Savoir que le cadre est local, et pas un copier-coller du RGPD, est un vrai signal en entretien sur un poste en Afrique de l'Ouest.

</details>

> ⚠️ **Le piège** — Dire « on hashe, donc c'est anonyme ». C'est juridiquement faux et techniquement fragile — et c'est exactement ce que la question cherche à vérifier.
>
> 📘 **Pour approfondir** : [22 · Cloud & object storage](/modules/intermediate__22_cloud_and_object_storage/) · [32 · Data Mesh & contracts](/modules/advanced__32_data_mesh_contracts/)
>
> 🇬🇧 *anonymization vs pseudonymization, salted hash, quasi-identifier, k-anonymity, right to erasure, crypto-shredding*

---

## 35. C'est quoi le data mesh ? Le recommanderais-tu ?

`occasionnelle` · `🌍 international` · **EN** — *What is data mesh? Would you recommend it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

C'est une approche où chaque équipe métier devient responsable de ses propres données, au lieu de tout centraliser dans une équipe data unique.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Quatre principes :

1. **Ownership par domaine** — l'équipe qui produit la donnée en est responsable.
2. **La donnée comme produit** — avec documentation, SLA, qualité, et des consommateurs identifiés.
3. **Plateforme self-service** — l'équipe centrale fournit les outils, pas les pipelines.
4. **Gouvernance fédérée** — des standards communs, appliqués localement.

C'est une réponse au goulot d'étranglement de l'équipe data centrale, qui finit par bloquer toute l'organisation tout en ne comprenant aucun métier en profondeur.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Le data mesh est avant tout une réponse **organisationnelle** à un problème d'échelle. Il ne devient pertinent qu'au-delà d'une certaine taille : plusieurs domaines métier autonomes, et une équipe data centrale devenue un goulot d'étranglement identifié. Le mettre en place dans une entreprise de deux Data Engineers est une erreur coûteuse — on distribue une complexité que personne n'a les moyens d'absorber, et on obtient des silos avec plus d'outils qu'avant.

Ma position, que j'assume en entretien : **la plupart des entreprises qui parlent de data mesh ont besoin d'un lakehouse centralisé bien documenté**, pas d'un mesh.

Le prérequis systématiquement sous-estimé, c'est que **la plateforme self-service doit exister avant** de distribuer la responsabilité. Sans elle, on annonce aux équipes métier « vous êtes responsables de vos données » sans leur donner ni compétences ni outillage : la qualité s'effondre, et l'organisation recentralise dix-huit mois plus tard en ayant perdu du temps et de la crédibilité.

Mais l'obstacle le plus dur n'est ni technique ni organisationnel : il est **incitatif**. Le mesh demande à des équipes produit d'assumer une charge — maintenir un data product, répondre à des consommateurs, tenir un SLA — qui n'est pas leur priorité et sur laquelle elles ne sont pas évaluées. Sans un alignement explicite des objectifs au niveau de la direction, le mesh échoue quel que soit l'outillage.

Savoir répondre « je ne le recommanderais pas dans ce contexte » est souvent la meilleure réponse à cette question. Un candidat qui déroule les quatre principes avec enthousiasme sans jamais interroger la taille de l'organisation montre qu'il a lu le livre, pas qu'il a vécu la transformation.

</details>

> ⚠️ **Le piège** — Réciter les quatre principes sans jamais poser la question de la taille de l'organisation. Le data mesh appliqué trop tôt fait plus de mal que de bien.
>
> 📘 **Pour approfondir** : [32 · Data Mesh & contracts](/modules/advanced__32_data_mesh_contracts/) · [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/)
>
> 🇬🇧 *data mesh, domain ownership, data as a product, self-serve platform, federated governance, incentive alignment*

---

← **Thème précédent** : [🔄 Orchestration & CI/CD](/entretien-orchestration/)

📋 [**Tous les thèmes**](/entretien-questions/)

**Thème suivant** : [💬 Comportemental & posture](/entretien-comportemental/) →
