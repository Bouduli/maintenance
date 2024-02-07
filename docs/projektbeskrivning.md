# Projektbeskrivning Mini-Axami
Axami erbjuder ett underhålls-system för att kunna skapa och administrera serviceärenden för sina produkter. Mini-Axami (axamini? ) är en mindre version av detta system, men som dock skall innehålla samma funktionalitet.

**Systemet skall innehålla funktionalitet för tre olika användargrupper (roller):**
- Ägare av systemet (mini-axami) - Systemets administratör som säljer denna tjänsten till kunder.
- Användare / Kunder - Användare av tjänsten, d.v.s. dem som skapar serviceärenden för sina produkter.
- Workers / Hantverkare / Service tekniker - Eventuella konsulter som anlitas och bjuds in i systemet för att kunna se serviceärenden och fullfölja dem.

**STARK STARK REKOMMENDATION**:
- Gör Api:n först.
- Testa med postman (alla routes, alla funktioner)
- Titta på gränssnitt först när API:n är testad och klar. 


**ÖVRIG REKOMMENDATION:**
- Börja med API för Användare/Kunder (se strukturen ovan)
- DÖLJ SAKER SOM INTE ÄR KLARA (vid redovisning). 

## Funktionskrav
Funktionskraven för systemet har delats in för de olika användargrupperna listade ovan. 

### Ägare av systemet (super admin)
Ägare av systemet skall kunna Skapa och Ta bort användare ur systemet, detta sker via ett administratörsgränssnitt. 
**Krav**
- Skapa och Ta bort användarkonton \[CD]
- (Låg prio) Administratörsgränssnitt som är **dator-anpassat**

### Användare / Kunder
Användare av systemet skall kunna lägga in och ta bort sina (fastigheter/produkter) i systemet, skapa och ta bort serviceärenden, bjuda in och ta bort hantverkare/servicetekniker. Detta skall ske genom ett mobilanpassat och datoranpassat. 
**Krav**
- Skapa, Lista, Uppdatera och Ta bort **Fastigheter** \[CRUD]
- Skapa, Lista, Uppdatera och Ta bort **Serviceärenden (Tasks)** \[CRUD]
- Skapa, Lista, Uppdatera och Ta bort **Hantverkare / Servicetekniker** \[CRUD]
- Användargränssnitt som är **Mobil + dator-anpassat**
- Inloggning med **ett användarkonto** ( PWL är inte nödvändigt)
## Hantverkare / Servicetekniker
Hantverkare och servicetekniker skall kunna registrera sig med en aktiveringslänk och logga in passwordless, uppdatera serviceärenden/Tasks med en "klar markering", kommentarer. Dessutom skall de kunna skapa önskemål på andra serviceärenden. Stor vikt ligger på ett mobil-anpassat gränssnitt. 
**Krav**
- Användargränssnitt som är **Mobilanpassat** (för stora tummar)
- Registrering med aktiveringslänk (epost kanske)
- Passwordless inloggning (epost)
- Lista och Uppdatera (med checkboxar, kommentarer) **Serviceärenden**  \[RU]
- Skapa och Lista **Önskemål Till Serviceärenden** \[CR]
