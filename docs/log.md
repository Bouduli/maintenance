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

### Onsdag 14/02
Dagens saker: 
- Alla handlers för Houses använder just nu `db.query()` för att skicka sina requests och minimera boilerplate för databasen. 
- `db.js` är städad, och innehåller nu bara `query()`.
- Alla handlers för task är klara och färdiga. 

### Måndag 19/02
*Contractors.js - ännu en router*


### Torsdag 22/02 
**Plan: Implementera access control, på något sätt.**
Steg för att uppnå detta:
- [x] Lägga till en "Hash" kolumn i användartabellen. 
- [x] Göra ett sätt att registrera en användare (som endast SuperAdmin har tillgång till.)
- [x] Göra inloggning
- [ ] Middleware över existerande routers.
