# Trip Planner App — Spécifications

## Vue d'ensemble

Application mobile de planification de voyages entre amis. L'app permet de créer un voyage, inviter des participants, voter collectivement sur les choix (dates, destinations, transport, logement, activités), puis visualiser le voyage complet avec toutes les réservations.

Figma designs : https://www.figma.com/design/vi7F12e7R7vtUUK1dzCzTt

## Stack technique

- **Framework mobile** : React Native avec Expo
- **Navigation** : Expo Router (file-based routing)
- **State management** : React hooks (useState/useEffect) + Firebase listeners
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Langage** : TypeScript
- **Style** : React Native StyleSheet API

Justification : Expo permet un démarrage rapide avec un seul codebase iOS/Android. Firebase fournit auth (email/password), base de données Firestore, et realtime listeners sans gérer de serveur. Le state management repose sur les hooks React natifs et les listeners Firestore, sans librairie externe.

---

## Architecture des données

### Collections Firestore

```
/users/{userId}
  - userId: string (= Firebase Auth UID)
  - email: string
  - displayName: string
  - avatarUrl: string | null
  - createdAt: Timestamp

/trips/{tripId}
  - name: string
  - description: string | null
  - coverImageUrl: string | null
  - createdBy: string (userId)
  - shareCode: string (8 caractères, unique)
  - status: 'planning' | 'confirmed' | 'completed'
  - startDate: string | null (YYYY-MM-DD)
  - endDate: string | null (YYYY-MM-DD)
  - countryDestination: string | null
  - maxBudget: number | null
  - currency: string | null
  - createdAt: Timestamp

/trips/{tripId}/participants/{participantId}
  - userId: string
  - role: 'organizer' | 'participant'
  - joinedAt: Timestamp

/trips/{tripId}/polls/{pollId}
  - title: string
  - category: 'dates' | 'destination' | 'transport' | 'accommodation' | 'activity'
  - allowMultipleVotes: boolean (default true)
  - status: 'open' | 'closed'
  - createdBy: string (userId)
  - createdAt: Timestamp

/trips/{tripId}/polls/{pollId}/options/{optionId}
  - label: string
  - description: string | null
  - price: string | null
  - url: string | null
  - createdBy: string (userId)
  - createdAt: Timestamp

/trips/{tripId}/polls/{pollId}/options/{optionId}/votes/{voteId}
  - userId: string
  - createdAt: Timestamp

/trips/{tripId}/planningItems/{itemId}
  - pollId: string | null
  - title: string
  - description: string | null
  - category: 'transport' | 'accommodation' | 'activity'
  - date: string | null (YYYY-MM-DD)
  - timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all_day' | null
  - status: 'confirmed' | 'booked'
  - bookingReference: string | null
  - bookingUrl: string | null
  - price: string | null
  - createdAt: Timestamp
```

### Sécurité (Firestore Security Rules)

Les règles Firestore garantissent qu'un utilisateur ne peut lire/écrire que les données des voyages auxquels il participe.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profils utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Voyages — accessible uniquement aux participants
    match /trips/{tripId} {
      allow read: if request.auth != null && isParticipant(tripId);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isOrganizer(tripId);

      // Sous-collections du voyage
      match /{document=**} {
        allow read: if request.auth != null && isParticipant(tripId);
        allow write: if request.auth != null && isParticipant(tripId);
      }
    }

    function isParticipant(tripId) {
      return exists(/databases/$(database)/documents/trips/$(tripId)/participants/$(request.auth.uid));
    }

    function isOrganizer(tripId) {
      return get(/databases/$(database)/documents/trips/$(tripId)/participants/$(request.auth.uid)).data.role == 'organizer';
    }
  }
}
```

---

## Écrans et navigation

### Structure de navigation

```
/ (landing page — branding + login/signup)
├── /login (email/password login)
├── /register (email/password registration)
├── /forgot-password (réinitialisation mot de passe)
├── /trips (liste des voyages + création)
├── /profile (profil utilisateur)
├── /settings (paramètres)
├── /trips/[id] (layout avec bottom tabs)
│   ├── /trips/[id]/planning (onglet Planning — défaut)
│   ├── /trips/[id]/polls (onglet Sondages)
│   └── /trips/[id]/details (détails/édition du voyage)
├── /trips/[id]/info (modal — paramètres du voyage)
├── /trips/[id]/poll/[pollId] (modal — voter sur un sondage)
├── /trips/[id]/poll/new (modal — créer un sondage)
└── /join/[shareCode] (deep link — rejoindre un voyage)
```

### Écran 1 : Accueil (`/trips`)

Liste de tous les voyages de l'utilisateur. Pas de tab bar sur cet écran.

**Éléments :**
- Header : titre "Mes voyages"
- Liste de cartes voyage, chacune affichant :
    - Nom du voyage
    - Nombre de participants
    - Dates (si définies)
    - Badge de statut :
        - Orange "X votes" si des sondages sont ouverts
        - Vert "Confirmé" si tout est réservé
        - Grisé "En attente" si aucun sondage n'est encore créé
- Bouton "+" Nouveau voyage en bas
- Les voyages sans activité récente sont affichés en opacité réduite

**Comportement :**
- Tap sur une carte → navigation vers `/trips/[id]/planning`
- Tap sur "+ Nouveau voyage" → modal de création
- Pull-to-refresh pour recharger la liste
- Realtime subscription : la liste se met à jour quand un vote est enregistré ou un sondage créé

### Écran 2 : Vue voyage — Onglet Sondages (`/trips/[id]/(tabs)/polls`)

**Éléments :**
- Header : nom du voyage + sous-titre (participants, dates)
- Bouton info (i) en haut à droite → ouvre la modal `/trips/[id]/info`
- Liste des sondages, chacun affichant :
    - Titre du sondage (ex: "Quel logement ?")
    - Badge compteur de votes "X/Y" (votes reçus / total participants)
    - Les options avec :
        - Nom de l'option
        - Prix si renseigné
        - Avatars (initiales) des participants ayant voté pour cette option
    - L'option avec le plus de votes est mise en avant (fond bleu clair)
- Sondages terminés : affichés en opacité réduite avec badge "Terminé" vert
- Bouton "+ Créer un sondage" (bordure pointillée)
- Bottom navigation : 2 onglets "Planning" et "Sondages" (actif)

**Comportement :**
- Tap sur un sondage ouvert → modal de vote `/trips/[id]/poll/[pollId]`
- Tap sur "+ Créer un sondage" → modal `/trips/[id]/poll/new`
- Realtime : les votes apparaissent en temps réel (avatars, compteur)

### Écran 3 : Vue voyage — Onglet Planning (`/trips/[id]/(tabs)/planning`)

**Éléments :**
- Header : identique à l'onglet Sondages (nom, info, sous-titre)
- Timeline verticale jour par jour :
    - Pastille ronde avec le numéro du jour
        - Jour actuel/premier jour : fond bleu plein, texte blanc
        - Autres jours : fond bleu clair, texte bleu
    - Ligne verticale connectant les jours
    - Sous chaque jour : label "Lundi · Arrivée" (jour de la semaine + thème optionnel)
    - Items du planning sous forme de cartes :
        - Titre de l'item
        - Description/horaire
        - Badge de statut :
            - Vert "Réservé" (booking_reference renseigné)
            - Orange "Vote" (lié à un sondage encore ouvert)
            - Pas de badge si confirmé mais pas encore réservé
- Bottom navigation : 2 onglets "Planning" (actif) et "Sondages"

**Comportement :**
- Tap sur un item "Vote" → navigue vers le sondage associé
- Tap sur un item confirmé/réservé → bottom sheet pour voir/éditer les détails (numéro de résa, lien)
- Les items sont triés par date puis par time_of_day (morning < afternoon < evening < all_day)

### Modal : Voter (`/trips/[id]/poll/[pollId]`)

Flow en 3 états (voir Figma page "Flow de vote") :

**État 1 — Avant le vote :**
- Titre du sondage
- Sous-titre "Tap pour voter · choix multiple" (ou "choix unique" selon la config)
- Liste des options avec checkbox vide à droite
- Bouton "Valider mon vote" désactivé (gris)

**État 2 — Sélection en cours :**
- Options sélectionnées : fond bleu clair, bordure bleue, checkbox cochée bleue
- Options non sélectionnées : fond blanc, bordure grise
- Sous-titre mis à jour : "X options sélectionnées"
- Bouton "Valider mon vote" activé (bleu plein)

**État 3 — Après validation (résultats) :**
- Chaque option affiche le nombre de votes + barre de progression proportionnelle
- L'option gagnante est mise en avant (fond vert, bordure verte)
- Badge "X/X" vert quand tous ont voté
- Si l'utilisateur est l'organisateur : bouton "Confirmer le gagnant" (vert)
    - Action : ferme le sondage, crée un planning_item avec l'option gagnante

**Comportement :**
- Si l'utilisateur a déjà voté, afficher directement l'état 3 (résultats)
- Realtime : les résultats se mettent à jour en temps réel

### Modal : Créer un sondage (`/trips/[id]/poll/new`)

**Éléments :**
- Champ texte : titre du sondage
- Sélecteur de catégorie : dates, destination, transport, logement, activité
- Toggle : "Choix multiple" (on/off)
- Section options :
    - Chaque option a : label (requis), description, prix
    - Bouton "+ Ajouter une option"
    - Minimum 2 options requises
- Bouton "Créer le sondage"

### Modal : Créer un voyage (`/trip/new`)

**Éléments :**
- Champ texte : nom du voyage (requis)
- Champ texte : description (optionnel)
- Bouton "Créer"
- Après création → affiche le lien de partage avec bouton copier/partager

### Modal : Infos du voyage (`/trips/[id]/info`)

**Éléments :**
- Nom du voyage (éditable par l'organisateur)
- Description (éditable par l'organisateur)
- Liste des participants avec avatars
- Lien de partage avec bouton copier
- Bouton "Quitter le voyage" (pour les participants)
- Bouton "Supprimer le voyage" (pour l'organisateur uniquement)

---

## Flow : Sondage → Planning

C'est le mécanisme central de l'app. Voici le flow détaillé :

1. L'organisateur crée un sondage avec des options
2. Les participants votent (realtime, les avatars apparaissent en temps réel)
3. Quand l'organisateur clôture le sondage (bouton "Confirmer le gagnant") :
    - Le sondage passe en status `closed`
    - Un `planning_item` est automatiquement créé avec :
        - `title` = label de l'option gagnante
        - `description` = description de l'option
        - `category` = catégorie du sondage
        - `price` = prix de l'option
        - `poll_id` = référence au sondage source
        - `status` = `confirmed`
4. L'item apparaît dans l'onglet Planning
5. Après réservation externe, l'organisateur ou un participant peut :
    - Taper sur l'item dans le planning
    - Ajouter le numéro de confirmation / lien de réservation
    - Le statut passe à `booked`

---

## Features additionnelles

### 1. Lien de partage pour inviter

- Chaque voyage a un `share_code` unique (8 caractères, généré à la création)
- L'organisateur partage un lien de type `https://tripplanner.app/join/[shareCode]`
- Le lien ouvre l'app (deep link) ou redirige vers le store
- Le participant qui ouvre le lien est automatiquement ajouté au voyage après auth
- Utiliser la Share API native pour partager via WhatsApp, iMessage, etc.

### 2. Ajouter une option à un sondage existant

- Sur un sondage ouvert, n'importe quel participant peut ajouter une nouvelle option
- Bouton "+ Ajouter une option" visible en bas de la liste des options dans la modal de vote
- Ouvre un mini-formulaire inline : label + description + prix
- L'option ajoutée apparaît immédiatement (realtime) pour tous les participants

### 3. Numéro de confirmation sur les items du planning

- Chaque item réservé dans le planning peut contenir :
    - `booking_reference` : numéro de confirmation (texte libre)
    - `booking_url` : lien vers la réservation (Booking, Airbnb, etc.)
- Accessible via tap sur l'item dans le planning → bottom sheet d'édition
- Tous les participants peuvent voir et copier ces informations

---

## Design system

### Couleurs (semantic tokens)

```
primary:        #378ADD  (bleu — actions, éléments actifs)
success:        #1D9E75  (vert — confirmé, réservé, terminé)
warning:        #BA7517  (ambre — votes en cours, en attente)
danger:         #E24B4A  (rouge — suppression, erreurs)

background:     #FFFFFF
surface:        #F5F5F3
text-primary:   #1A1A1A
text-secondary: #6B6B6B
text-tertiary:  #A0A0A0
border:         rgba(0,0,0,0.12)

blue-bg:        #E6F1FB
blue-text:      #185FA5
green-bg:       #E1F5EE
green-text:     #0F6E56
amber-bg:       #FAEEDA
amber-text:     #854F0B
```

### Typographie

- Font : System default (San Francisco sur iOS, Roboto sur Android)
- Titre écran : 22px semi-bold
- Titre section : 18px semi-bold
- Titre carte : 15px medium
- Corps : 13px regular
- Caption : 11px regular
- Badge : 10px medium

### Composants réutilisables

- `Badge` : pill avec fond coloré + texte, variantes success/warning/info
- `TripCard` : carte avec nom, participants, dates, badge statut
- `PollCard` : sondage avec titre, options, avatars, compteur
- `PollOption` : option de vote avec label, prix, checkbox/avatars
- `PlanningDayHeader` : pastille jour + label
- `PlanningItem` : carte item avec titre, description, badge statut
- `BottomTab` : navigation 2 onglets avec indicateur actif
- `Avatar` : cercle avec initiale, fond coloré
- `InfoButton` : cercle avec icône "i", ouvre la modal info

### Espacements

- Padding écran : 20px horizontal
- Gap entre cartes : 8-10px
- Padding interne carte : 10-14px
- Border radius cartes : 10-12px
- Border radius badges : 6px

---

## Realtime

Utiliser les listeners Firestore (`onSnapshot`) pour les subscriptions temps réel :

```typescript
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

// Sur la page d'accueil : écouter les changements sur les voyages de l'utilisateur
// Note : nécessite un index composite sur trips/participants
const tripsQuery = query(
  collection(db, 'trips'),
  where('__name__', 'in', participantTripIds)
);
const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    handleTripChange(change.type, change.doc);
  });
});

// Sur un sondage : écouter les votes en temps réel
const votesRef = collection(db, `trips/${tripId}/polls/${pollId}/options/${optionId}/votes`);
const unsubscribeVotes = onSnapshot(votesRef, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') handleNewVote(change.doc);
  });
});
```

---

## Auth

- Firebase Auth avec email/password
- Écrans login, inscription, et mot de passe oublié (`sendPasswordResetEmail`)
- Après inscription, un document utilisateur est créé dans la collection `users` :

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await setDoc(doc(db, 'users', userCredential.user.uid), {
  userId: userCredential.user.uid,
  email: email,
  displayName: 'Voyageur',
  createdAt: serverTimestamp(),
});
```

---

## Structure des fichiers

```
firebaseConfig.js                    # Initialisation Firebase (auth + db exports)
app/
├── _layout.tsx                      # Root Stack navigator
├── index.tsx                        # Landing page (branding + login/signup)
├── login.tsx                        # Login (email/password)
├── register.tsx                     # Inscription (email/password)
├── forgot-password.tsx              # Réinitialisation mot de passe
├── profile.tsx                      # Profil utilisateur
├── settings.tsx                     # Paramètres
├── trips.tsx                        # Liste des voyages + création
├── trips/
│   └── [id]/
│       ├── _layout.tsx              # Layout trip detail
│       ├── (tabs)/
│       │   ├── _layout.tsx          # Layout avec bottom tabs
│       │   ├── planning.tsx         # Onglet Planning (défaut)
│       │   └── polls.tsx            # Onglet Sondages
│       ├── details.tsx              # Détails/édition du voyage
│       ├── info.tsx                 # Modal infos voyage
│       └── poll/
│           ├── new.tsx              # Modal création sondage
│           └── [pollId].tsx         # Modal vote
├── join/
│   └── [shareCode].tsx              # Deep link rejoindre voyage
components/
├── Badge.tsx
├── TripCard.tsx
├── PollCard.tsx
├── PollOption.tsx
├── PlanningDayHeader.tsx
├── PlanningItem.tsx
├── BottomNavBar.tsx
├── Avatar.tsx
└── InfoButton.tsx
lib/
└── types.ts                         # Types TypeScript
```

---

## Priorités d'implémentation

### Phase 1 — MVP (shipper en premier)
1. Auth (email/password)
2. Créer un voyage
3. Lien de partage + rejoindre un voyage
4. Créer un sondage avec options
5. Voter sur un sondage
6. Clôturer un sondage → créer un planning item
7. Voir le planning

### Phase 2 — Polish
8. Ajouter une option à un sondage existant
9. Numéro de confirmation sur les items du planning
10. Deep links

### Phase 3 — Nice to have
11. Photo de couverture du voyage
12. Export du planning (PDF ou partage)
13. Mode hors ligne basique