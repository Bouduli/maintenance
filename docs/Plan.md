# Plan över arbetet / saker som måste fixas

## FRONTEND
### Vyer
#### Användare/kund
- [ ] Tab som Visar alla hus
    - [ ] Formulär för att lägga till ett hus

- [ ] Tab som visar alla Tasks
    - [ ] Formulär för att lägga till tasks
    - [ ] Knapp för att tilldela task till contractor
- [ ] Tab som visar förslag till tasks
    - [ ] Knapp för att approva-task.

- [ ] Tab som visar alla contractors
    - [ ] Formulär för att skapa en contractor

#### Contractor / Worker
- [ ] Tab som visar alla tilldelade tasks
    - [ ] Grupperade efter hus (?)
- [ ] Formulär för att lägga till ett förslag på tasks.

#### Systemadministratör
- [ ] Tab som visar alla användare
    - [ ] Formulär för att lägga till en användare

## API
### Generella saker
- [ ] Filuppladdning för diverse olika databasobjekt
- [x] Middlewares för access control
- [x] **req.user i loggedIn middleware**
- [ ] **SÄKRA UPP CRUD routes med req.user, istället för req.body**
- [x] Epost-klient för att kuna skicka iväg epost.
    - [x] Testa epost-klienten. 
- [ ] **(!!!) Script eller något sätt att skapa en databas åt en organisation.**

### För användargrupper
##### Användare / Kund

- [x] Router med CRUD för Fastigheter
- [x] Router med CRUD för Tasks
    - [x] Möjligheten att lista tasks
- [x] Router med CRUD för Workers.
- [x] Stateful inloggning.

##### Workers
- [x] Router med RU för Tasks
    - [x] Förslag till tasks
- [x] Passwordless inloggning

##### Systemadministratörer
- [ ] Router med CRUD för användarkonton
    - [x] CRD för användarkonton
- [x] Stateful inloggning. (admin bool vid inloggning + middleware)

