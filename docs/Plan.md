# Plan över arbetet / saker som måste fixas

## API
### Generella saker
- [ ] Filuppladdning för diverse olika databasobjekt
- [x] Middlewares för access control
- [ ] **req.user i loggedIn middleware**
- [ ] **SÄKRA UPP CRUD routes med req.user, istället för req.body**
- [x] Epost-klient för att kuna skicka iväg epost.
    - [x] Testa epost-klienten. 
- [ ] **(!!!) Script eller något sätt att skapa en databas åt en organisation.**

### För användargrupper
##### Användare / Kund

- [x] Router med CRUD för Fastigheter
- [x] Router med CRUD för Tasks
- [x] Router med CRUD för Workers.
- [x] Stateful inloggning.

##### Workers
- [x] Router med RU för Tasks
- [x] Passwordless inloggning

##### Systemadministratörer
- [ ] Router med CRUD för användarkonton
- [ ] Stateful inloggning.

