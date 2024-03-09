# Loggbok
*Detta är en loggbok över projektets förlopp, vars syfte är att ha dokumenterat (nästan) hela projektet från start(\*) till finish*

### Onsdag 07/02
Projektet inleds, en beskrivning av uppgiften fås av Fredric, och tankar över upplägg och struktur genomtänks. 

**Funderingar över en tech-stack resulterar ungefär i:**
- **Server:** NodeJS + Express
- **Front-end:** Svelte
- **Databas:** MySQL - koppling till server med en ORM eller driver (mysql2)

Valet av server motiveras i den mån att jag är van vid att skriva back-end med Express. Därför känner jag att jag rimligtvis kommer kunna skriva och hantera en API, mer än jag hade förhållandevis kunnat med Go+Fiber eller Rust+Axum.

PHP har säkert sina fördelar med att möjligheten att vara hårt typat, samtidigt som det kan vara smidigt för att komma igång också. Dock ser jag några fallgropar med att använda PHP för denna API, nämligen:
- **Jag vill kunna skriva explicita `DELETE`, `PUT` och `PATCH` routes** - vilket PHP och 'ramverket' för routing jag hade valt (*[php-router](https://phprouter.com/)*)
- Jag tycker om friheten i att välja individuella npm paket och moduler för att fylla mina ändamål - medan PHP ger en det mesta
- PHPs variabel-scoping, där mina variabler inte kan 'läcka in' i ett mindre scope. 

### Torsdag 08/02
Planer över min databas-struktur funderas över och mina krav promptas till ChatGPT för att ge mig en huvudsaklig databas-struktur.
Huvudsakligen skall data lagras i tabellerna:
- Users
- Houses
- Tasks
- Contractors
- Contractor_Tasks

**Users** och **Contractors** tabellerna skall huvudsakligen innehålla kontaktuppgifter, såsom epost, namn och telefonnummer. Eftersom User skall använda stateful login skall denna tabelle också innehålla ett *password-hash*, därför skall även en lösning för detta att implementeras på servern. Då Contractors skall använda passwordless-inloggning skall den tabellen inte inehålla någon hash, samtidigt som JWT och en Epost-klient behöver implementeras på servern.

### Fredag 09/02
*Fortsatt grubblande över databas-struktur...*

Dessutom skulle det vara bra att faktiskt säkerställa att epost-addresser som skickas in till servern faktiskt är epost-adresser. Herr ChatGPT har promptas för hur detta kan implementeras i databasen, dock skulle det säkert kunna räcka, och vara bättre om detta kollas på servern först...

En separat katalog i projektet har skapats där allt som har med databasen att göra, inklusive GPT prompts och eventuella skisser och tanke-dokument skall äga rum. Huvudsakligen skall denna katalog användas för att innehålla en backup av databasens struktur (inklusive sub-routines) **när en sådan väl har färdigställts.**

**Sidenote:** *Detta dokument har påbörjats.*
**P.S:** det är inte kul att försöka ångra sina commits och försöka få snyggare historik.

### Måndag 12/02
dagens tankar: 
- **Bilder? -** Lagra filer separat på servern (NodeJS FS) och spara filepath med I en separat SQL tabell. som är typ: 
```sql
    DROP TABLE IF EXISTS Images
    imageID INT AUTO_INCREMENT PRIMARY KEY,
    houseID INT,
    filePath VARCHAR(255),
    FOREIGN KEY (houseID) REFERENCES House(houseID)
```
- QueryBuilder till Mysql. 

### Tisdag 13/02
Dagens saker:
- Querybuilder abandonas i stunden, med motivering att jag behöver komma igång med att göra en säker och funktionell api. 
- Api-Routes och databas funktioner håller på att skrivas för Houses och Tasks.-
- databas kanske skall struktureras om (?) för att den börjar bli jobbig nu.

**Plan för framtiden är:** 
1. Skapa alla routes (och hårdkodade databasfunktioner) för att uppfylla all funktionalitet
2. Fixa filuppladdning och strukturera det på något vettigt sett. 
3. Säkra upp systemet med Stateful authentication för SuperAdmins och kunder, och PWL för contractors. 
4. Skapa gränssnitt med Svelte.

### Onsdag 14/02
Dagens saker: 
- Alla handlers för Houses använder just nu `db.query()` för att skicka sina requests och minimera boilerplate för databasen. 
- `db.js` är städad, och innehåller nu bara `query()`.
- Alla handlers för task är klara och färdiga. 

### Fredag 16/02
Epost-klient har skapats med nodemailer...
Och en plan.md har upprättats för att underlätta framtida arbete.

### Måndag 16/02
Epost-klienten har testats för Html funktionalitet.
Funderar på att använda bilder med ett json fält, för varje 'sak' i databasen. 
Har strukturerat om routers, för nu började index bli väldigt stor.

Generellt gäller följande struktur:

```
~api_express/
    index.js
    db.js
    routers/
        | houses.js
        | tasks.js
        | contractors.js
```

**Ett säkert\* sätt att skicka och minska boilerplaten som skickas har skapats:** - En funktion tar emot en SQL query, och skickar eventuella props. SQL queryn skrivs av caller-funktionen, och är på så sätt validerad från callern - På så sätt kommer inte felaktiga/farliga request kunna uppstå av en användares input, eftersom detta direkt inte påverkar hur queryn ser ut. 

Också:
*Contractors.js - ännu en router*

### Torsdag 22/02 
**Plan: Implementera access control, på något sätt.**
Steg för att uppnå detta:
- [x] Lägga till en "Hash" kolumn i användartabellen. 
- [x] Göra ett sätt att registrera en användare (som endast SuperAdmin har tillgång till.)
- [x] Göra inloggning
- [x] Middleware över existerande routers.

### Måndag 26/02
Simpelt middleware för att kolla om en person är inloggad, samt struggle att hämta in email-branchen till denna branch (förberedelse inför pwl)

### Tisdag 27/02
**PASSWORDLESS SUPERIORITY**

(obs dock finns ingen router för workers ännu, så det finns inget ställe att använda detta på)
#### Plan för veckan: BLI KLAR MED API
Detta omfattar: 
- [ ] **Göra min worker-specifika router**
    - [x] Lista tasks
    - [x] Markera tasks klara
    - [ ] Lägga till önskemål
- [x] **Göra att Users och Workers får Epost när dessa har blivit registrerade**
- [ ] **Script, Rutin, eller Route, för att skapa en ny databas, åt ett specifikt företag, med en user åt dem.**
    - [ ] *Göra att connectionPool i `db.js` använder specifika användarkonton och databaser...*

### Onsdag 28/02 
Saker som har gjorts:
- Created + Last-updated fält i MySQL databas. 

Saker som skall göras framöver:
- Göra en req.user med ett middleware, som lagrar userID för en användare. 
- Säkra upp mina routes för alla operationer, så att en användare endast kan läsa de hus som den har tillgång till.

### Torsdag 29/02 (ja det är skottår)
Saker som har gjorts: 
- req.user har implementerats för worker-router.
- buggfixar för diverse routes. 

### Fredag 01/03
Saker som har gjorts:
- **Task suggestion**
- Task approval

Saker som borde göras:
- Super-admin router (flytta över User-registrering)
- Företag specifika databaser (setup script? )

### Söndag 03/03
Saker som har gjorts:
**Företags-admin router**: CRD för användarkonton, delete är en anonymisering + inaktivering, som gör att kontot inte kan användas för inloggning.

Saker som måste fixas innan API är 'klar':
- Företag-specifika databaser.
- Script för att starta databas, med ett sql-användarkonto.

### Måndag 04/03
Saker som har gjorts
- Password reset.
- contractorID används i task_contractor tabellen


### Tisdag 05/03
Saker som har gjorts:
- Anonymisering vid contractor-delete
- Anonymisering vid house-delete
- Invited_by fält till contractors_tabellen
- Droppat databasen (whoops)

### Onsdag 06/03
Saker som har gjorts:
*frontend med **alpine.js** har påbörjats*en robust user-vy
Login vy

### Torsdag 07/03
Saker som har gjorts: User Vyn är nästan klar.
Fetch requests har gjorts för att skapa Houses och Tasks.

### Fredag 08/03
Saker som har gjorts: User vyn är klar funktionsmässigt..

Saker som skall göras:
- [x] Endast visa hus som inloggad användare har skapat.
- [x] Endast visa tasks som inloggad användare har skapat.

### Lördag 09/03
User vyn är i stora drag klar (funktionsmässigt) då endast möjligheten att visa förslag saknas.

Ändringar till APIn:
- En användare kan endast se Hus och Tasks som den har lagt-till / skapat.
- En ny route GET "/task/appointee/:id" har skapats - den returnerar alla contractors som är tilldelade tasken med id-parametern. Detta används till att visa tilldelade hantverkare för varje task.

Ändringar till Frontend:
- Formulär för att tilldela contractors till en task
- Möjligheten att visa contractors tilldelade till varje task.
- Möjligheten att som användare ta bort* en Contractor*, Task eller Hus* (*: dessa anonymiseras, det borde väl egentligen Tasks göra oxå).

Planer inför framtiden:
- [ ] Visa, ta bort(det behövs api route), och approva föreslagna tasks (suggestions)
- [ ] Worker vyn
- [ ] Admin vyn
- [ ] **CSS korståg.**
