# 💬 Comportemental & posture

> **Rappel** — 🟢 **junior** : correct mais incomplet · 🔵 **confirmé** : le niveau attendu sur la plupart des postes · 🟣 **senior** : trade-offs, cas limites, ce qui casse à l'échelle.
> Réponds d'abord à voix haute, **puis** déplie. [← Tous les thèmes](/entretien-questions/)

> 🎯 **Ces questions décident plus souvent que les questions techniques.** À compétence technique égale, c'est là que se fait le choix entre deux candidats — et c'est le seul thème qui se prépare vraiment à l'avance, parce qu'on n'improvise pas une bonne histoire.

---

## 36. Raconte-moi un incident de production dont tu étais responsable.

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *Tell me about a production incident you were responsible for.*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Raconte ce qui s'est passé et comment ça a été corrigé, souvent sans structure, et en attribuant la cause à un tiers : « la source a changé son format sans prévenir ».

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Utilise la structure **STAR** :

- **Situation** — le contexte et l'enjeu (quel pipeline, quels utilisateurs).
- **Tâche** — ton rôle précis dans l'affaire.
- **Action** — ce que **tu** as fait : décisions, arbitrages, communication.
- **Résultat** — l'issue, chiffrée si possible, puis ce que tu en as tiré et ce que tu as changé ensuite.

Et assume ta part de responsabilité au lieu de la déplacer.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ce que le recruteur teste ici n'est pas ta technique — il l'a vue ailleurs. Il teste ta **capacité à assumer et à transformer un échec en système**. Trois marqueurs font la différence.

**L'appropriation.** Dire « j'ai déployé sans tester le cas des données en retard » est infiniment plus fort que « la source a changé son format sans prévenir », **même quand la seconde phrase est vraie**. La première montre ce que tu contrôles ; la seconde te place en victime des événements. Les recruteurs expérimentés écoutent précisément ça.

**Le raisonnement sous incertitude.** Comment as-tu décidé avec des informations partielles ? Comment as-tu arbitré entre corriger vite et corriger bien ? C'est là qu'on voit un ingénieur qui a réellement géré une crise.

**Le changement systémique.** Pas « j'ai corrigé le bug », mais « j'ai ajouté un contrôle de fraîcheur, et depuis on détecte ce type de panne en quinze minutes au lieu de trois jours ». Un incident qui ne produit pas de changement durable est un incident qu'on revivra — et le dire montre que tu penses en systèmes, pas en tickets.

Trois conseils pratiques. **Choisis un incident où tu as une part réelle de responsabilité** — pas celui où tu es le héros qui répare la faute des autres, c'est transparent. **Quantifie l'impact** (quatre heures de retard sur les rapports, deux jours de chiffres faux) : sans chiffre, l'histoire ne pèse rien. Et **ne cite jamais un collègue nommément en négatif** : le recruteur en déduit immédiatement comment tu parleras de lui.

Prépare deux ou trois histoires solides à l'avance. C'est un investissement rentable : personne n'improvise correctement cette réponse, et ça se sent.

</details>

> ⚠️ **Le piège** — Choisir un incident où tout est la faute d'un autre. Même si c'est vrai, ça ne montre rien de ce que le recruteur cherche.
>
> 📘 **Pour approfondir** : [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/) · [28 · Orchestration avancée](/modules/advanced__28_advanced_orchestration/)
>
> 🇬🇧 *STAR method, ownership, blameless post-mortem, root cause, systemic fix*

---

## 37. Comment expliques-tu un concept technique à quelqu'un qui n'est pas technique ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *How do you explain a technical concept to a non-technical stakeholder?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

J'essaie de simplifier, d'éviter le jargon et d'utiliser des exemples concrets.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je pars de l'**impact métier**, pas du mécanisme. J'utilise une analogie tirée du monde de mon interlocuteur, puis je vérifie la compréhension en lui demandant de reformuler.

J'adapte aussi le niveau : un directeur veut le « et alors ? » et le coût ; un chef de produit veut les conséquences sur ses délais ; un analyste veut savoir ce qui change dans ses chiffres.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La règle que j'applique : **commencer par la conclusion et la décision attendue**, jamais par le contexte. Un dirigeant écoute trente secondes. Si tu ouvres par « alors, Kafka fonctionne avec des partitions… », tu l'as déjà perdu. La bonne ouverture ressemble à : *« Je recommande d'investir trois semaines pour refaire l'ingestion. Sinon les rapports resteront faux une fois par semaine. Je peux détailler pourquoi. »* Le détail ne vient que si on te le demande — et souvent on ne te le demande pas, ce qui est un bon signe.

Sur les analogies, un avertissement utile : elles sont efficaces mais **elles mentent toujours un peu**. Une analogie mal choisie crée une fausse compréhension, plus difficile à corriger ensuite que l'ignorance de départ. Je préfère une image simple dont j'annonce la limite : « l'image s'arrête là ».

Le test qui ne trompe pas, c'est de demander à l'interlocuteur de **reformuler avec ses mots**. Et le point de posture qui change tout : si sa reformulation est fausse, ce n'est pas lui qui n'a pas compris — c'est moi qui ai mal expliqué. Cette façon de voir transforme complètement la relation avec le métier, et elle se perçoit dans un entretien.

Enfin, l'erreur la plus fréquente des ingénieurs n'est pas le jargon : c'est de **répondre à une question plus large que celle posée**. On te demande « quand est-ce que ce sera prêt ? » et tu réponds par une explication d'architecture. Réponds à la question posée, puis propose d'aller plus loin. C'est une discipline, et elle est très visible en entretien — y compris sur les questions techniques.

</details>

> ⚠️ **Le piège** — Commencer par le contexte technique et garder la conclusion pour la fin. En réunion de direction, la conclusion doit venir en premier.
>
> 📘 **Pour approfondir** : [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
>
> 🇬🇧 *stakeholder communication, bottom line up front, analogy, active listening*

---

## 38. Tu es en désaccord technique avec quelqu'un de plus expérimenté. Comment tu gères ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *You disagree technically with someone more senior than you. How do you handle it?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

J'expose mon point de vue, et si la personne est plus expérimentée que moi, je me range à son avis.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je cherche d'abord à comprendre **son** raisonnement : il y a souvent un contexte qui m'échappe (une contrainte historique, un incident passé, un engagement pris auprès d'un client).

Ensuite j'argumente sur des **faits** — un prototype, un benchmark, des chiffres — plutôt que sur des préférences. Si le désaccord persiste, on tranche selon un critère explicite ou on remonte d'un niveau. Et une fois la décision prise, je m'y engage pleinement, même si ce n'était pas mon choix.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ma règle de conduite : distinguer les décisions **réversibles** des décisions **irréversibles**.

Sur une décision réversible — le nom d'une colonne, une bibliothèque facile à remplacer —, insister coûte plus cher que d'avoir tort. Je cède vite et je passe à autre chose. Ce n'est pas de la faiblesse, c'est une allocation de mon capital politique : on ne peut pas se battre sur tout, et celui qui se bat sur tout n'est écouté sur rien.

Sur une décision coûteuse à défaire — le format de table, le partitionnement d'une table de plusieurs téraoctets, le choix d'un fournisseur —, j'insiste et j'accepte le conflit, parce que le coût de l'erreur est asymétrique.

Sur la méthode, un principe qui marche presque à tous les coups : **un désaccord se résout mieux avec un prototype qu'avec un argument**. Deux heures de benchmark closent un débat de deux semaines, et surtout ça déplace la discussion d'un rapport entre personnes vers un rapport aux faits — ce qui permet à chacun de changer d'avis sans perdre la face.

Un point d'expérience que je partage volontiers : quand quelqu'un de plus expérimenté prend une décision qui me paraît mauvaise, il y a très souvent une contrainte que j'ignore. Poser *« qu'est-ce qui t'a amené à ce choix ? »* avant d'argumenter m'a évité de me tromper bien plus souvent que l'inverse.

Enfin, si la décision ne va pas dans mon sens, je la soutiens publiquement — mais je documente mon désaccord par écrit, factuellement et sans agressivité. Pas pour pouvoir dire « je l'avais dit » : pour que **si le risque se matérialise, l'équipe réagisse vite** au lieu de redécouvrir le problème depuis zéro. C'est ce qu'on appelle *disagree and commit*, et c'est une compétence de senior.

</details>

> ⚠️ **Le piège** — Répondre « je me range à l'avis du plus expérimenté ». Sur un poste senior, c'est disqualifiant : on attend de toi que tu challenges, avec méthode.
>
> 📘 **Pour approfondir** : [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
>
> 🇬🇧 *disagree and commit, reversible vs irreversible decision, one-way door, proof of concept*

---

## 39. Tout est urgent et tu ne peux pas tout faire. Comment tu priorises ?

`fréquente` · `🌍 international` `🏦 local` · **EN** — *Everything is urgent and you can't do it all. How do you prioritize?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

Je traite d'abord ce que mon manager juge le plus urgent, et j'essaie de tout faire en travaillant plus.

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Je clarifie l'**impact réel** et l'échéance de chaque demande — « urgent » signifie souvent « je n'ai pas envie d'attendre ». Je priorise ensuite sur le rapport impact/effort et sur le **coût du retard**.

Pour la dette technique, je ne la traite pas comme un projet séparé qu'on ne financera jamais : je l'intègre au fil de l'eau, dans les tâches qui touchent déjà la zone concernée.

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

La question qui débloque presque toutes les situations : **« qu'est-ce qui se passe si on ne le fait pas cette semaine ? »**. Elle transforme une liste de dix urgences en deux vraies urgences et huit préférences. Elle est bien plus efficace que « est-ce prioritaire ? », à laquelle tout le monde répond oui.

Sur la **dette technique**, l'erreur classique est de la vendre en termes techniques : « il faut refactorer l'ingestion ». Aucun décideur ne finance ça, et il a raison — la phrase ne contient aucune information exploitable pour lui. Il faut la traduire en risque et en coût : *« chaque modification sur ce pipeline nous prend trois jours au lieu d'une demi-journée, et nous a coûté deux incidents ce trimestre ; deux semaines de travail ramènent ça à une demi-journée. »* Même information, mais elle devient une décision d'investissement, avec un retour calculable.

Point important, et contre-intuitif : **toute la dette ne doit pas être remboursée**. De la dette sur un pipeline stable qu'on ne touche jamais est de la dette qu'on peut garder à vie sans conséquence. Je cible uniquement celle qui se trouve sur le chemin des évolutions à venir. Un ingénieur qui veut tout nettoyer par principe consomme du budget sans créer de valeur.

Enfin, quand tout est réellement urgent **et que ça dure**, ce n'est plus un problème de priorisation : c'est un problème de **capacité**. Le dire clairement, avec des chiffres à l'appui, fait partie du travail. Accepter silencieusement une charge intenable pour paraître fiable est la façon la plus sûre de décevoir plus tard — et c'est le piège dans lequel tombent le plus souvent les profils juniors et consciencieux.

</details>

> ⚠️ **Le piège** — Répondre « je travaille plus » ou « je fais tout ». Le recruteur cherche quelqu'un capable d'**arbitrer et de dire non**, avec des arguments.
>
> 📘 **Pour approfondir** : [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/) · [34 · Patterns d'architecture](/modules/advanced__34_architecture_patterns_decisions/)
>
> 🇬🇧 *cost of delay, technical debt, impact vs effort, capacity planning, saying no*

---

## 40. Quelles questions poses-**tu** au recruteur ?

`très fréquente` · `🌍 international` `🏦 local` · **EN** — *What questions do you have for us?*

<details>
<summary>🟢 <b>Réponse junior</b></summary>

« Non merci, j'ai eu toutes mes réponses. » Ou uniquement des questions sur le salaire, les horaires et les congés.

*C'est la réponse la plus coûteuse de tout l'entretien — et la plus facile à éviter.*

</details>

<details>
<summary>🔵 <b>Réponse confirmé</b></summary>

Des questions sur l'**équipe** (taille, séniorité, répartition des responsabilités), sur la **stack et son état réel**, sur le **processus** (comment un changement part en production, y a-t-il des tests, une astreinte), et sur les **attentes** (qu'attend-on de moi dans les six premiers mois ?).

</details>

<details>
<summary>🟣 <b>Réponse senior</b></summary>

Ne rien demander est le pire signal possible : ça dit « je prends n'importe quel poste ». Mes questions préférées, choisies parce que **les réponses sont réellement discriminantes** :

1. **« Quelle est la dette technique dont vous n'êtes pas fiers ? »** — Le silence ou le déni est un signal d'alarme. Une réponse honnête et précise indique une culture d'ingénierie saine.
2. **« Que se passe-t-il quand un pipeline casse la nuit ? Qui est prévenu, et à quelle fréquence ça arrive ? »** — Révèle instantanément la maturité opérationnelle **et** la qualité de vie réelle du poste.
3. **« Comment savez-vous qu'une donnée exposée est juste ? »** — S'il n'y a pas de réponse structurée, tu passeras ton temps à éteindre des incendies.
4. **« Qu'est-ce qui a fait qu'une personne a échoué à ce poste ? »** — Souvent bien plus instructif que « quel est le profil idéal ? ».
5. Au manager : **« comment saurez-vous, dans six mois, que j'ai réussi ? »** — Si la réponse est floue, l'évaluation sera arbitraire, et ta progression aussi.

Le point de posture, au-delà des questions elles-mêmes : l'entretien est **bilatéral**, et poser ces questions change la perception qu'on a de toi. Tu passes du candidat qui postule au professionnel qui évalue une opportunité. C'est particulièrement vrai sur les postes seniors, où **ne pas challenger est disqualifiant**.

Deux choses à éviter : les questions dont la réponse est sur le site de l'entreprise (ça montre que tu n'as pas préparé), et le salaire lors d'un premier entretien technique — sauf si c'est ton interlocuteur qui l'aborde.

</details>

> ⚠️ **Le piège** — « Non, j'ai eu toutes mes réponses. » Prépare trois questions **écrites** avant chaque entretien ; c'est le rattrapage le moins cher de tout le processus.
>
> 📘 **Pour approfondir** : [35 · Leadership & trade-offs](/modules/advanced__35_leadership_tradeoffs/) · [01 · Intro Data Engineering](/modules/beginner__01_intro_data_engineering/)
>
> 🇬🇧 *reverse interview, on-call rotation, engineering culture, success criteria, red flags*

---

## 🎓 Tu as fait le tour des 40 questions

Bravo — tu as couvert les six thèmes. Deux conseils pour transformer ça en résultat :

1. **Refais un passage à voix haute** sur les questions où tu as hésité. La deuxième fois est toujours plus révélatrice que la première.
2. **Passe à la pratique.** Les questions valident ta compréhension ; un projet valide ta capacité à livrer — et c'est ce qu'on te demandera de présenter.

> 📌 Enchaîne avec le [mini-projet dbt exécutable](/modules/intermediate__25_dbt_data_quality/) et le [projet intégrateur](/modules/intermediate__26_projet_integrateur/).

---

← **Thème précédent** : [✅ Data Quality & gouvernance](/entretien-qualite/)

📋 [**Tous les thèmes**](/entretien-questions/)
