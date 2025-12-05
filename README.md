# 📘 Projet Universitaire – Plateforme de Gestion de Projet

### Front-End • Back-End • DevSecOps

## 🎯 Présentation du projet

Ce projet universitaire consiste en la réalisation d’une **plateforme web de gestion de projet**, intégrant une interface moderne, un back-end sécurisé et une approche DevSecOps complète. L’objectif est de permettre aux utilisateurs de **créer, consulter, suivre et gérer** des projets ainsi que les membres associés.

Le projet vise également à appliquer des **bonnes pratiques professionnelles** : organisation modulaire, sécurité, CI/CD, documentation, et utilisation d’outils professionnels.

---

## 🚀 Objectifs pédagogiques

* Comprendre et appliquer l’architecture **Front-End / Back-End**
* Gérer la persistance des données (BDD)
* Mettre en place la sécurité applicative et les bonnes pratiques **DevSecOps**
* Utiliser une pipeline CI/CD pour automatiser tests, analyse, et déploiement
* Apprendre à documenter et structurer un projet web complet

---

## 🧩 Fonctionnalités principales

### 🔹 Gestion des projets

* Création d’un projet (nom, description, budget, dates)
* Modification et suppression
* Gestion du statut (En cours, Terminé, En pause)
* Suivi de l’avancement

### 🔹 Gestion des membres et contacts

* Ajout de membres à un projet
* Stockage des rôles et informations de contact
* Assignation des tâches

### 🔹 Tableau de bord

* Vue globale des projets
* Statistiques (projets actifs, terminés, en retard)

### 🔹 Sécurité

* Validation des données
* Analyse automatique du code
---

## 🛠️ Technologies utilisées

### 🖥️ Front-End

* HTML5 / CSS3 / JavaScript
* Framework CSS
* Composants interactifs en JavaScript
* Modales pour ajout de projet/contact

### 🧩 Back-End

* PHP (PDO)
* Interactions sécurisées avec la base de données

### 🗄️ Base de données

* MySQL
* Tables
* Contraintes, relations, clés étrangères

### 🔐 DevSecOps

* Git & GitHub
* CI/CD : GitHub Actions
* Analyse de code : SonarCloud, Snyk, Dependabot
* Surveillance des vulnérabilités

## 🔧 Installation et exécution

### 1️⃣ Clone du projet

```bash
git clone https://github.com/apoulain-dot/Projet-3.git
```

### 2️⃣ Configuration du Back-End

* Configurer la connexion à la base MySQL
* Importer le fichier SQL fourni :

```sql
gtf.sql;
```

### 3️⃣ Lancer l’application

#### Version classique (PHP)

Placer les fichiers dans un serveur local :

```
http://localhost/Projet-3
```
## 🔒 Sécurité (DevSecOps)

### 🔍 Contrôles automatiques :

* Analyse statique CodeQL
* Scan des failles Snyk
* Tests unitaires automatisés
* Pipeline CI/CD bloquant en cas de vulnérabilité critique

### 🔐 Mesures de sécurité :

* Paramétrage des permissions DB
* Protection contre injections SQL
* Sanitation des entrées utilisateurs

---

## 📝 Contributions du groupe

Chaque membre a participé à un domaine spécifique :

* **Front-End** : design, UX, interactions
* **Back-End** : base de données
* **DevSecOps** : pipeline CI/CD, sécurité

---

## 🏁 Conclusion

Ce projet universitaire illustre une approche complète et professionnelle de la création d’une application web : de la conception à la sécurité, en passant par l’implémentation et l’automatisation. Il constitue une base solide pour des projets futurs dans le domaine du développement web et DevSecOps.
