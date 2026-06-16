# Manuel d'Utilisation — Boutique Ges

> Application de gestion de boutique/alimentation : ventes, stock, clients, caisse, fournisseurs, rapports.

---

## Table des matières

1. [Connexion et accès](#1-connexion-et-accès)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Produits / Stock](#3-produits--stock)
4. [Ventes](#4-ventes)
5. [Clients](#5-clients)
6. [Caisse](#6-caisse)
7. [Fournisseurs et achats](#7-fournisseurs-et-achats)
8. [Dettes anciennes](#8-dettes-anciennes)
9. [Factures](#9-factures)
10. [Inventaire](#10-inventaire)
11. [Rapports](#11-rapports)
12. [Vendeurs](#12-vendeurs)
13. [Comptes utilisateurs](#13-comptes-utilisateurs)
14. [Paramètres boutique](#14-paramètres-boutique)
15. [Profil utilisateur](#15-profil-utilisateur)

---

## 1. Connexion et accès

### Connexion
- Saisir le nom d'utilisateur et le mot de passe sur la page de connexion.
- Cliquer **Se connecter**.

### Rôles disponibles
| Rôle | Accès |
|------|-------|
| **ADMIN** | Accès complet à toutes les fonctions |
| **VENDEUR** | Ventes, clients, caisse (lecture), produits (lecture) |
| **STOCK** | Produits, achats fournisseurs, inventaire |

### Déconnexion
- Cliquer sur **Déconnexion** dans la barre du haut (en haut à droite).

---

## 2. Tableau de bord

**Nombre de fonctions : 5**

| Fonction | Description |
|----------|-------------|
| Chiffre d'affaires du jour | Montant total des ventes enregistrées aujourd'hui |
| Nombre de ventes du jour | Compteur de ventes validées |
| Solde caisse actuel | Solde en temps réel de la caisse |
| Alertes stock bas | Produits dont le stock est inférieur au seuil minimum |
| Accès rapide | Boutons de navigation vers les sections principales |

---

## 3. Produits / Stock

**Nombre de fonctions : 10**

| Fonction | Description |
|----------|-------------|
| Liste des produits | Tableau paginé de tous les produits avec stock actuel |
| Recherche produit | Recherche par nom ou référence en temps réel |
| Filtre par catégorie | Filtrer la liste par catégorie de produit |
| Créer un produit | Formulaire : nom, catégorie, prix de vente, prix d'achat, stock initial, seuil minimum |
| Modifier un produit | Mettre à jour les informations d'un produit existant |
| Supprimer un produit | Suppression définitive (uniquement si aucune vente liée) |
| Alerte stock bas | Mise en évidence des produits sous le seuil minimum |
| Retour fournisseur | Sélectionner un achat fournisseur → les produits achetés s'affichent automatiquement → modifier la quantité à retourner → le stock est ajusté |
| Export liste produits | Export PDF ou impression de la liste des produits |
| Pagination | Navigation page par page dans la liste |

### Comment faire un retour fournisseur
1. Dans la liste, cliquer **Retour** sur un achat.
2. La liste des produits achetés s'affiche pré-remplie avec les quantités.
3. Modifier les quantités à retourner si besoin.
4. Cliquer **Valider le retour**.
5. Le stock se met à jour automatiquement.

---

## 4. Ventes

**Nombre de fonctions : 16**

| Fonction | Description |
|----------|-------------|
| Liste des ventes | Tableau paginé de toutes les ventes avec colonnes Client, Vendeur, Montant, Statut |
| Recherche vente | Recherche par numéro de vente, client ou produit |
| Filtres | Par date, type (comptant/crédit), statut, mode de paiement |
| Nouvelle vente comptant | Sélectionner produits + quantités + client → total calculé automatiquement |
| Nouvelle vente crédit | Même saisie + date d'échéance + montant versé en acompte |
| Paiement mixte | Combiner avance client + espèces/mobile money |
| Annuler une vente | Annulation complète → stock des produits remis à jour automatiquement |
| Retour produit (vente) | Sélectionner des produits dans une vente → quantités retournées préremplies → stock mis à jour |
| Remboursement avance | Si la vente avait été payée (partiellement ou totalement) avec une avance client, le remboursement est splitté automatiquement : avance recréditée, espèces remboursées depuis la caisse |
| Règlement crédit | Saisir un montant partiel ou total pour régler une vente crédit |
| Voir le détail | Afficher tous les produits, prix et modes de paiement d'une vente |
| Imprimer la facture | Génération PDF de la facture d'une vente |
| Export PDF liste | Export PDF de la liste filtrée des ventes |
| Colonne Client | Nom du client associé à la vente |
| Colonne Vendeur | Nom du vendeur qui a réalisé la vente |
| Pagination | 10 ventes par page avec navigation |

### Comment enregistrer un retour avec avance
1. La vente avait été payée : ex. 5 000 FCFA avance + 2 500 FCFA espèces = 7 500 FCFA total.
2. Cliquer **Retour** sur la vente.
3. Les produits avec quantités vendues apparaissent automatiquement.
4. Sélectionner les produits à retourner, ajuster les quantités.
5. Valider : le système rembourse automatiquement 5 000 FCFA sur l'avance du client et 2 500 FCFA en sortie caisse.

---

## 5. Clients

**Nombre de fonctions : 14**

| Fonction | Description |
|----------|-------------|
| Liste des clients | Tableau paginé (10 par page) + vue mobile en cartes |
| Recherche | Par nom, prénom ou numéro de téléphone |
| Créer un client | Formulaire : nom, prénom, téléphone, adresse, email |
| Modifier un client | Mettre à jour les informations |
| Supprimer un client | Suppression avec confirmation |
| Voir les ventes du client | Liste filtrée de toutes les ventes associées au client |
| Filtres sur ventes client | Par numéro de vente, type (comptant/crédit), mois |
| Voir les ventes clients divers | Liste des ventes sans client identifié |
| Historique des paiements | Toutes les transactions (ventes comptant + règlements crédits) chronologiques |
| Déposer une avance | Enregistrer un dépôt d'avance pour un client (mode de paiement, référence) |
| Historique des avances | Voir toutes les avances déposées, utilisées et disponibles par client |
| Export PDF ventes | Export de toutes les ventes / ventes comptant / ventes crédit d'un client |
| Export PDF crédits | Export détaillé des crédits en cours ou réglés |
| Pagination | 10 clients par page |

---

## 6. Caisse

**Nombre de fonctions : 8**

| Fonction | Description |
|----------|-------------|
| Solde actuel | Affichage du solde courant de la caisse |
| Entrée caisse | Enregistrer un encaissement manuel (ex : remboursement fournisseur) |
| Sortie caisse | Enregistrer une dépense (ex : frais de livraison) |
| Historique des mouvements | Toutes les entrées/sorties avec date, motif, montant |
| Filtres par date | Filtrer les mouvements sur une période |
| Filtres par type | Entrée ou sortie uniquement |
| Total par période | Calcul automatique des totaux sur la période filtrée |
| Export PDF | Export de l'historique filtré |

---

## 7. Fournisseurs et achats

**Nombre de fonctions : 9**

| Fonction | Description |
|----------|-------------|
| Liste des fournisseurs | Tous les fournisseurs enregistrés |
| Créer un fournisseur | Nom, téléphone, adresse, email |
| Modifier/Supprimer | Gestion complète |
| Enregistrer un achat | Sélectionner fournisseur + produits + quantités + prix d'achat → stock mis à jour |
| Liste des achats | Historique de tous les achats fournisseurs |
| Filtres achats | Par fournisseur, date |
| Retour fournisseur | Depuis un achat, retourner des produits partiellement (pré-rempli automatiquement) |
| Détail d'un achat | Voir la liste des produits et quantités d'un achat |
| Total achats | Montant total dépensé par fournisseur ou sur une période |

---

## 8. Dettes anciennes

**Nombre de fonctions : 10**

| Fonction | Description |
|----------|-------------|
| Liste des dettes | Tableau paginé (10 par page) avec statut, montant initial, montant restant |
| Filtre Non réglées | Afficher uniquement les dettes en cours |
| Filtre Réglées | Afficher uniquement les dettes soldées |
| Filtre Toutes | Afficher toutes les dettes |
| Recherche | Par nom, téléphone ou description du client |
| Créer une dette | Sélectionner client + montant + date crédit + description |
| Modifier une dette | Modifier uniquement si aucun règlement n'a encore été effectué |
| Supprimer une dette | Uniquement si aucun paiement n'a été enregistré |
| Enregistrer un règlement | Paiement partiel ou total avec mode de paiement et référence |
| Voir l'historique | Liste de tous les paiements effectués sur une dette |

### Statistiques affichées
- Nombre de dettes en cours
- Montant total restant
- Pourcentage global remboursé
- Total remboursé

---

## 9. Factures

**Nombre de fonctions : 5**

| Fonction | Description |
|----------|-------------|
| Liste des factures | Toutes les factures générées |
| Recherche | Par numéro de facture ou client |
| Visualiser | Aperçu de la facture avec logo de la boutique |
| Télécharger PDF | Génération et téléchargement de la facture en PDF |
| Réimprimer | Réimprimer une facture existante |

---

## 10. Inventaire

**Nombre de fonctions : 6**

| Fonction | Description |
|----------|-------------|
| Saisie inventaire | Saisir la quantité réelle en stock pour chaque produit |
| Écarts automatiques | Le système calcule l'écart entre stock théorique et réel |
| Validation inventaire | Mettre à jour le stock avec les valeurs saisies |
| Historique inventaires | Liste des inventaires passés avec dates |
| Filtres | Par date ou produit |
| Export | Export PDF du rapport d'inventaire |

---

## 11. Rapports

**Nombre de fonctions : 7**

| Fonction | Description |
|----------|-------------|
| Rapport des ventes | Chiffre d'affaires par période (jour, semaine, mois) |
| Rapport des achats | Montants achetés par fournisseur et par période |
| Rapport caisse | Mouvements de caisse sur une période |
| Produits les plus vendus | Classement par quantité vendue |
| Rapport crédits | État des ventes crédit en cours et réglées |
| Évolution du stock | Comparaison stock début/fin de période |
| Export PDF | Export de tous les rapports |

---

## 12. Vendeurs

**Nombre de fonctions : 6**

| Fonction | Description |
|----------|-------------|
| Liste des vendeurs | Tous les utilisateurs avec rôle VENDEUR |
| Ventes par vendeur | Filtrer les ventes par vendeur |
| Chiffre d'affaires | Montant total par vendeur sur une période |
| Nombre de ventes | Compteur de ventes par vendeur |
| Filtres par date | Période personnalisable |
| Export | Export PDF des statistiques vendeurs |

---

## 13. Comptes utilisateurs

**Nombre de fonctions : 5** *(réservé ADMIN)*

| Fonction | Description |
|----------|-------------|
| Liste des comptes | Tous les utilisateurs de l'application |
| Créer un compte | Nom, prénom, identifiant, mot de passe, rôle (ADMIN/VENDEUR/STOCK) |
| Modifier un compte | Modifier les informations ou le rôle |
| Désactiver/Activer | Suspendre un accès sans supprimer le compte |
| Réinitialiser mot de passe | Définir un nouveau mot de passe pour un utilisateur |

---

## 14. Paramètres boutique

**Nombre de fonctions : 6** *(réservé ADMIN)*

| Fonction | Description |
|----------|-------------|
| Nom de la boutique | Modifier le nom affiché partout dans l'application |
| Adresse | Adresse physique de la boutique (apparaît sur les factures) |
| Téléphone | Numéro de contact (affiché sur les factures) |
| Logo | Uploader un logo personnalisé (image max 2 Mo — JPG, PNG, GIF) |
| Aperçu du logo | Le logo uploadé s'affiche instantanément dans la sidebar, le header et les factures PDF |
| Sauvegarde | Les paramètres sont enregistrés en base de données et persistants |

### Comment changer le logo
1. Aller dans **Paramètres boutique**.
2. Cliquer sur **Choisir un fichier** dans la section Logo.
3. Sélectionner une image (JPG, PNG ou GIF, max 2 Mo).
4. Un aperçu s'affiche immédiatement.
5. Cliquer **Enregistrer le logo**.
6. Le logo s'affiche dans toute l'application (sidebar, header, factures PDF).

---

## 15. Profil utilisateur

**Nombre de fonctions : 3**

| Fonction | Description |
|----------|-------------|
| Voir son profil | Nom, prénom, rôle, date de création du compte |
| Modifier ses informations | Nom, prénom, email |
| Changer son mot de passe | Ancien mot de passe requis pour validation |

---

## Récapitulatif général

| Section | Nombre de fonctions |
|---------|-------------------|
| Connexion / Accès | 3 |
| Tableau de bord | 5 |
| Produits / Stock | 10 |
| Ventes | 16 |
| Clients | 14 |
| Caisse | 8 |
| Fournisseurs et achats | 9 |
| Dettes anciennes | 10 |
| Factures | 5 |
| Inventaire | 6 |
| Rapports | 7 |
| Vendeurs | 6 |
| Comptes utilisateurs | 5 |
| Paramètres boutique | 6 |
| Profil utilisateur | 3 |
| **TOTAL** | **113** |

---

## Conseils d'utilisation

- **Sauvegarde** : Effectuer des exports PDF régulièrement pour conserver une trace des données.
- **Caisse** : Toujours vérifier le solde caisse en fin de journée.
- **Stock** : Consulter les alertes stock bas chaque matin pour anticiper les commandes fournisseurs.
- **Crédits** : Vérifier régulièrement les crédits en retard dans la section Ventes (filtre "Crédit retard").
- **Avances** : Les avances clients sont automatiquement utilisées lors d'une vente et remboursées en cas de retour.

---

*Manuel généré pour Boutique Ges — Application de gestion de boutique/alimentation*
