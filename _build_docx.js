const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TabStopType, TabStopPosition, PageOrientation
} = require('docx');

// ============================================================
// HELPERS
// ============================================================

const p = (text, opts = {}) => new Paragraph({
  children: text instanceof Array ? text : [new TextRun({ text, ...opts.run })],
  spacing: { after: 120, ...opts.spacing },
  ...opts.paragraph
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text })],
  spacing: { before: 480, after: 240 }
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text })],
  spacing: { before: 360, after: 180 }
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text })],
  spacing: { before: 240, after: 120 }
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [new TextRun({ text })],
  spacing: { after: 60 }
});

const bulletBold = (boldText, restText) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [
    new TextRun({ text: boldText, bold: true }),
    new TextRun({ text: restText })
  ],
  spacing: { after: 60 }
});

const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  children: [new TextRun({ text })],
  spacing: { after: 60 }
});

const blank = () => new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 60 } });

// Table helpers
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

const tCell = (text, opts = {}) => new TableCell({
  borders,
  width: { size: opts.width || 4680, type: WidthType.DXA },
  shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: [new Paragraph({
    children: [new TextRun({ text, bold: opts.bold || false })]
  })]
});

// ============================================================
// CONTENT
// ============================================================

const titleBlock = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 360 },
    children: [new TextRun({ text: 'Schema.org-strukturoidun datan toteutus', bold: true, size: 44 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'kolmekampusta.fi-sivuston hakukonenäkyvyyden parantaminen', size: 28 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Yhteenveto', italics: true, size: 24 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2400 },
    children: [new TextRun({ text: '17. toukokuuta 2026', size: 22 })]
  }),
  new Paragraph({ children: [new PageBreak()] })
];

const section1 = [
  h1('1. Mikä tämä projekti on?'),
  p('Tässä projektissa kolmekampusta.fi-sivustolle on lisätty kattava schema.org-strukturoitu data, joka kertoo Googlelle ja muille hakukoneille tarkasti, mitä sivustolla on. Toteutus on tehty Google Tag Managerin (GTM) kautta, jolloin ylläpito onnistuu ilman ohjelmointia ja ilman Drupalin koodimuutoksia.'),
  p('Tämä dokumentti kuvaa selkokielisesti, mitä on tehty, miksi se tehtiin, mitä hyötyä siitä on ja mitä jatkossa kannattaa huomioida. Dokumentti on tarkoitettu kaikille, jotka tarvitsevat yleiskäsityksen aiheesta — ei tarvita teknistä taustaa.')
];

const section2 = [
  h1('2. Mitä on tehty'),
  p('Sivustolle on lisätty 25 erilaista schema.org-merkintää, jotka kuvaavat:'),
  bullet('Organisaation kokonaisuutta (Kolmen kampuksen urheiluopisto)'),
  bullet('Kolmea kampusta (Pajulahti, Kisakallio ja Mäkelänrinne)'),
  bullet('Majoituspalveluita molemmissa majoitusta tarjoavissa kampuksissa'),
  bullet('10 yksittäistä liikuntatilaa ja palvelua (Lake Pool, Seikkailupuisto, uimahalli, TAITO 360, palautumiskeskus, Sporttipassi, Kisakallion rantasauna, korkeanpaikan harjoittelu, testauspalvelut, väline- ja kenttävuokraus)'),
  bullet('Kolmea ravintolaa (Iso-Kukkanen, Kahvila Keihäs ja Rantamakasiini)'),
  bullet('Neljää koulutusohjelmaa (ammatillinen, oppisopimus, täydennys ja vapaa sivistystyö)'),
  bullet('Sivuston rakennetta (artikkelit, uutiset, blogit, tapahtumat, yhteystiedot, esittelysivut ja palvelut)'),
  blank(),
  p('Lisäksi luotiin GTM-järjestelmään 23 erilaista käynnistintä, jotka päättävät, milloin mikäkin merkintä julkaistaan. Yksi erikoismuuttuja huolehtii siitä, että kuvatiedot päivittyvät automaattisesti, kun sivun pääkuva vaihdetaan Drupalissa.')
];

const section3 = [
  h1('3. Käytetyt menetelmät'),

  h2('3.1 Schema.org-strukturoitu data'),
  p('Schema.org on Googlen, Microsoftin, Yahoon ja Yandexin yhteinen sanasto, jolla verkkosivut voivat kertoa hakukoneille sisältönsä rakenteen. Kun hakukoneen ei tarvitse arvailla, mistä yritystiedoista on kyse, se saa selkeät tiedot:'),
  bullet('"Tämä on majoituspalvelu osoitteessa X, jonka puhelinnumero on Y, varauslinkki Z ja hinta-alue €€."'),
  bullet('"Tämä on koulutusohjelma, jonka hakuaika alkaa 17. helmikuuta 2026."'),
  bullet('"Tämä on tapahtuma, joka järjestetään 17.—24. elokuuta 2026 Pajulahdessa."'),
  blank(),
  p('Strukturoitu data toimii käytännössä Googlen "ymmärrysapuna". Se ei muuta käyttäjille näkyvää sisältöä, mutta auttaa hakukoneita tunnistamaan, mitä sivulla on.'),

  h2('3.2 Google Tag Manager (GTM)'),
  p('GTM on Googlen ilmainen työkalu, jonka avulla verkkosivustolle voi lisätä erilaisia merkintöjä ja seurantakoodeja ilman, että sivuston lähdekoodia tarvitsee muokata. GTM-säiliö (kontti) on jo asennettu kolmekampusta.fi-sivustolle.'),
  p('GTM valittiin tähän projektiin kahdesta syystä:'),
  numbered('Operatiivinen riippumattomuus: Päivitykset onnistuvat ilman Druidin (sivuston tekninen toteuttaja) väliintuloa. Tämä säästää aikaa ja rahaa.'),
  numbered('Joustavuus: Uusien sivutyyppien ja merkintöjen lisääminen jälkikäteen onnistuu nopeasti.'),

  h2('3.3 Yhdistelmä käytännössä'),
  p('Schema.org-merkinnät luodaan GTM:n kautta ja injektoidaan sivustolle automaattisesti. Kun käyttäjä avaa sivun, GTM huomioi sivun tyypin (esimerkiksi onko kyseessä artikkeli, tapahtuma vai majoitussivu) ja lisää sopivat merkinnät sivun lähdekoodiin. Käyttäjä ei näe näitä merkintöjä, mutta hakukoneet näkevät.'),
  p('Drupalin oma murupolku-merkintä (BreadcrumbList) säilyy ennallaan — uudet merkinnät lisätään sen rinnalle, eivät korvaa sitä.')
];

const section4 = [
  h1('4. Realistiset odotukset'),
  p('Tärkein huomio: strukturoidun datan vaikutukset eivät näy hetkessä. Google indeksoi ja hyödyntää tietoja omalla aikataulullaan, ja muutokset hakutuloksissa tapahtuvat asteittain.'),

  h2('4.1 Lyhyt aikaväli (1—3 kuukautta julkaisusta)'),
  bullet('Google indeksoi uudet merkinnät 1—3 päivässä, kun pyydetään uudelleenindeksointia Search Console -työkalusta.'),
  bullet('Search Consolen "Parannukset"-raportti alkaa näyttää havaittuja merkintätyyppejä viikon sisällä.'),
  bullet('Hakutuloksissa alkaa näkyä rikkaita tuloksia (esimerkiksi yritystiedot, kartta ja aukioloajat) sivuilla, joiden tiedot Google katsoo luotettaviksi.'),
  blank(),
  p('Mitä EI vielä tapahdu lyhyellä aikavälillä: dramaattisia näkyvyysparannuksia, kävijämäärän selvää kasvua eikä hakusijoitusten radikaalia paranemista.'),

  h2('4.2 Keskipitkä aikaväli (3—6 kuukautta)'),
  bullet('Knowledge Panel -tiedot (Googlen tietopaneeli oikealla puolella hakutuloksia) päivittyvät tarkemmiksi.'),
  bullet('"Local business" -tulokset alkavat näkyä Pajulahti-, Kisakallio- ja Mäkelänrinne-hauissa.'),
  bullet('Tapahtumakohtaiset tulokset (Event rich results) näkyvät, kun tapahtumia haetaan.'),
  bullet('Ravintolatiedot näkyvät paremmin Google Maps -tuloksissa.'),
  bullet('Klikkausprosentit hakutuloksista voivat parantua, kun hakutulokset näyttävät houkuttelevammilta.'),

  h2('4.3 Pitkä aikaväli (6—12+ kuukautta)'),
  bullet('Googlen entiteetti-graafi vahvistuu. Tämä tarkoittaa, että Google ymmärtää 3K:n ja sen alaisten yksiköiden suhteet selvemmin: mikä on kampus, mikä on majoituspalvelu, mikä on koulutusohjelma ja miten ne liittyvät toisiinsa.'),
  bullet('Puheohjattu haku ja tekoälypohjaiset hakutulokset (kuten Google Gemini ja muut suuret kielimallit) voivat hyödyntää tietoja vastauksissaan.'),
  bullet('Koulutusohjelmien näkyvyys paranee, kun Google laajentaa koulutus-rikkaita tuloksia myös Suomeen. Tällä hetkellä ne ovat enimmäkseen yhdysvaltalaisten yliopistojen käytössä.'),
  bullet('Pidemmän tähtäimen brändinäkyvyys hakukoneissa vahvistuu.'),

  h2('4.4 Mitä strukturoitu data EI tee'),
  bullet('Se ei korvaa hakukoneoptimointia kokonaisuudessaan. Sisällön laatu, sivustonopeus ja linkkiprofiili pysyvät tärkeinä.'),
  bullet('Se ei takaa parempia sijoituksia hakutuloksissa. Google käyttää tietoa lisäsignaalina, ei suoraan sijoituksen muodostamiseen.'),
  bullet('Se ei tee mainontaa. Kyseessä on luonnollinen eli orgaaninen löydettävyys.'),
  bullet('Se ei korjaa sisältöongelmia. Jos sivulla itsessään ei ole kuvattu sisältöä hyvin, schema-data yksin ei pelasta.')
];

const section5 = [
  h1('5. Hyödyt (plussat)'),
  bulletBold('Riippumattomuus toteutuksesta. ', 'Päivitykset voi tehdä itsenäisesti ilman Druidia.'),
  bulletBold('Joustavuus. ', 'Uusien sivutyyppien lisääminen jälkikäteen onnistuu nopeasti.'),
  bulletBold('Skaalautuvuus. ', 'Sama järjestelmä palvelee kaikkia kolmea kampusta.'),
  bulletBold('Hakukoneystävällisyys. ', 'Antaa Googlelle tarkat tiedot, joiden pohjalta se voi näyttää rikkaita tuloksia.'),
  bulletBold('Knowledge Graph -hyödyt. ', '3K:n entiteetti vahvistuu Googlen tietokannassa.'),
  bulletBold('Dynaaminen kuvanhaku. ', 'Kun sivuston pääkuvaa päivitetään Drupalissa, schema-data päivittyy automaattisesti samalla. Ei tarvita erillistä GTM-päivitystä.'),
  bulletBold('Konsistenssi. ', 'Kaikki tieto on yhdessä paikassa GTM:ssä, joten päivitykset pysyvät yhtenäisinä.'),
  bulletBold('Kustannustehokkuus. ', 'Yhden henkilön ylläpidettävissä ilman ulkoisia kustannuksia.')
];

const section6 = [
  h1('6. Rajoitukset (miinukset)'),
  bulletBold('Tulokset eivät ole välittömiä. ', 'Google indeksoi ja hyödyntää tietoja omalla aikataulullaan, useimmiten viikkojen viiveellä.'),
  bulletBold('GTM-riippuvuus. ', 'JavaScriptin kautta toimiminen tarkoittaa, että vanhemmat hakurobotit tai erittäin rajoitetut selaimet eivät välttämättä näe merkintöjä. Googlebot näkee ne kuitenkin, koska se ajaa JavaScriptin.'),
  bulletBold('Strukturoitu data ei korvaa sisältöä. ', 'Jos sivulla itsessään ei ole kuvattu sisältöä hyvin, schema-data yksin ei pelasta.'),
  bulletBold('Ylläpidettävää. ', 'Kun sivustoa muutetaan oleellisesti (uusi sivutyyppi tai uudelleenstrukturointi), schema-data täytyy päivittää.'),
  bulletBold('Joitakin rikkaita tuloksia ei vielä Suomessa. ', 'Esimerkiksi koulutusohjelmien rikkaat tulokset ovat vasta rajatussa käytössä. Suomessa niitä ei vielä juurikaan näy hakutuloksissa.'),
  bulletBold('Mahdolliset duplikaatit toiminnan muutostilanteissa. ', 'Jos Drupaliin lisätään tulevaisuudessa toinen schema-toteutus, voi syntyä päällekkäisyyksiä. Tämä on huomioitava ennen suuria muutoksia.')
];

const section7 = [
  h1('7. Mitä tulee seurata'),

  h2('7.1 Google Search Console'),
  p('Search Console on Googlen ilmainen työkalu, jonka avulla voi seurata, mitä Google näkee sivustosta. Tärkeimmät raportit:'),
  bulletBold('Parannukset-raportti. ', 'Näyttää, mitä strukturoitua dataa Google on löytänyt ja onko siinä virheitä. Tärkein seurattava.'),
  bulletBold('Tulokset-raportti. ', 'Näyttää kävijämäärät ja klikkausprosentit hakutuloksista.'),
  bulletBold('Indeksointi-raportti. ', 'Näyttää, mitkä sivut on indeksoitu ja onko indeksoinnissa ongelmia.'),

  h2('7.2 Tarkistustaajuus'),
  bulletBold('Viikoittain ensimmäisten kuukausien ajan. ', 'Varmista, että Google löytää uudet merkinnät eikä virheitä tule.'),
  bulletBold('Kuukausittain vakiintumisen jälkeen. ', 'Yleisseuranta: onko muutoksia näkyvissä?'),
  bulletBold('Kvartaaleittain. ', 'Strategiapäivitys: mitä uutta sivustolla on, joka voisi hyötyä uusista merkinnöistä?'),

  h2('7.3 Validointityökalut ja niiden tärkeysjärjestys'),
  p('Schema-merkintöjen tarkistamiseen käytetään pääasiassa kahta työkalua. On tärkeää ymmärtää niiden ero, koska väärin tulkittuna varoitukset voivat aiheuttaa turhaa huolta.'),

  h3('Google Rich Results Test — tärkein työkalu'),
  p('Osoite: https://search.google.com/test/rich-results'),
  p('Tämä on tärkein validointityökalu, koska se tarkistaa juuri sen, mikä meille on oleellista: hyväksyykö Google merkinnät ja näyttääkö se rikkaita tuloksia. Jos Rich Results Test sanoo "Sivu on kelvollinen" tai "X kelvollista merkintää havaittu", merkintä on Googlen näkökulmasta kunnossa.'),
  p('Koko tämä projekti on rakennettu palvelemaan Googlea ja muita merkittäviä hakukoneita. Niinpä Rich Results Test on viime kädessä se mittari, johon nojaamme.'),

  h3('Schema.org Validator — toissijainen työkalu'),
  p('Osoite: https://validator.schema.org/'),
  p('Tämä on schema.org-yhteisön ylläpitämä työkalu, joka tarkistaa merkintöjä erittäin tiukasti virallista spesifikaatiota vastaan. Se näyttää usein varoituksia ja virheitä, joita Google ei kuitenkaan välitä. Tyypillisiä esimerkkejä tällaisista "vääristä hälytyksistä":'),
  bullet('Pajulahden ja Kisakallion kampuksilla "sport"-kenttä on osa monityypitettyä rakennetta (SportsActivityLocation + LodgingBusiness + EducationalOrganization). Schema.org Validator varoittaa, että "sport" ei kuulu EducationalOrganization-tyypille, mutta Google ymmärtää monityypityksen oikein.'),
  bullet('Kun käytämme dynaamista kuvamuuttujaa ({{js.og.image.or.fallback}}), Schema.org Validator näkee sen virheellisenä URL-osoitteena. Google sen sijaan korvaa muuttujan oikealla kuvalla ennen tarkistusta.'),
  bullet('Jotkin merkintätyypit (esimerkiksi koulutusohjelmat) näkyvät Rich Results Testissä tuloksena "ei havaittuja kohteita", koska Google ei ole vielä tuonut rikkaita tuloksia näille tyypeille Suomeen. Tämä ei tarkoita, että schema olisi väärin.'),

  h3('Käytännön ohje'),
  numbered('Käytä ensisijaisesti Google Rich Results Testiä. Jos se näyttää kelvolliset merkinnät, kaikki on hyvin.'),
  numbered('Schema.org Validator on toissijainen. Käytä sitä rakenteen tarkastamiseen, mutta älä huolestu kaikista varoituksista.'),
  numbered('Jos Rich Results Test näyttää virheen, korjaa se. Jos vain Schema.org Validator näyttää varoituksen, tarkista onko kyseessä jokin yllä mainituista tunnetuista tilanteista — jos on, varoituksen voi ohittaa.'),
  numbered('Tärkein periaate: rakennamme Googlea varten, emme schema.org-spesifikaatiota varten. Google on lopullinen tuomari.')
];

const section8 = [
  h1('8. Tulevaisuuden suunnitelma'),
  p('Kun sivustolle tulee uusia sivuja, palveluita tai osioita, ne pitää huomioida schema-toteutuksessa, jotta hyöty jatkuu.'),

  h2('8.1 Uudet sivutyypit'),
  p('Tiedossa on seuraavat tulevat uudet sivutyypit, joille suositellaan omat schema-merkintänsä:'),

  h3('Digikampus'),
  p('Kun digitaalinen oppimisalusta tulee, sille kannattaa lisätä oma EducationalOccupationalProgram- tai Course-merkintä, joka kertoo verkossa tapahtuvasta koulutuksesta. Mahdollisesti hyödynnetään myös LearningResource-tyyppiä yksittäisiä oppimateriaaleja varten.'),
  p('Tämä parantaa digitaalisten kurssien löydettävyyttä Google-hauista ja mahdollisesti tulevista koulutus-rikkaista tuloksista, kun Google laajentaa niitä Suomeen.'),

  h3('Sporttivuokraamo'),
  p('Jos tämä on erillinen, keskitetty vuokrauspalvelu, sille kannattaa luoda oma Service- tai Store-tyyppinen merkintä. Se tarkentaa nykyistä väline- ja kenttävuokraus-merkintää (nykyinen tagi 18). Tarvittaessa myös OfferCatalog-merkintä, jossa luetellaan vuokrattavat välineet ja kentät hintatietojen kanssa.'),
  p('Tämä parantaa hakukonelöydettävyyttä yksittäisille vuokrauskohteille, kuten "tenniskenttä vuokra Pajulahti" tai "kajakkivuokraus Kisakallio".'),

  h3('Rekrytointi'),
  p('Avoimet työpaikat kannattaa merkitä JobPosting-merkinnällä. Tämä mahdollistaa työpaikkailmoitusten näkymisen Google for Jobs -palvelussa, joka on tällä hetkellä yksi tehokkaimmista tavoista tavoittaa työnhakijoita verkossa. Google for Jobs näkyy hakutulosten yläosassa erityisenä työpaikkahaku-osiona ilman erillistä mainoskustannusta.'),
  p('Hyödyt rekrytoinnissa voivat olla merkittäviä: lisää hakemuksia laadukkailta hakijoilta ilman lisämaksua rekrytointialustoille.'),

  h2('8.2 Yleinen kehitysprosessi uusille sivutyypeille'),
  p('Kun uusi sivutyyppi otetaan käyttöön, etene näin:'),
  numbered('Tunnista sivutyyppi: mikä se on? (Esimerkiksi työpaikkailmoitus, kurssi tai palvelu.)'),
  numbered('Tarkista olemassa oleva schema.org-tyyppi: onko valmis tyyppi sopiva?'),
  numbered('Päätä toteutustapa: yksittäinen sivu, joka tarvitsee tarkan kuvauksen (uusi GTM-tagi), tai useita samantyyppisiä sivuja (laajenna olemassa olevaa Smart Content -tagia tai Smart Section -tagia).'),
  numbered('Päivitä molemmat lähdetiedostot (gtm-tags-production.md ja vastaava /tags/-kansion tiedosto).'),
  numbered('Validoi merkintä — ensisijaisesti Google Rich Results Testillä (tärkein) ja toissijaisesti Schema.org Validatorilla. Lisätietoa työkalujen tärkeysjärjestyksestä on luvussa 7.3. Älä huolestu Schema.org Validatorin pienistä varoituksista, jos Rich Results Test hyväksyy merkinnän.'),
  numbered('Lisää GTM:ään ja julkaise.'),
  numbered('Pyydä uudelleenindeksointia Search Console -työkalusta.'),

  h2('8.3 Ylläpito'),
  bulletBold('Kerran kvartaalissa: ', 'Tarkista, että kaikki linkit ja kuvat toimivat oikein.'),
  bulletBold('Kerran vuodessa: ', 'Tarkista schema.org-päivitykset: onko uusia ominaisuuksia, joita voidaan hyödyntää.'),
  bulletBold('Sivuston isompi uudistus: ', 'Käytä mahdollisuus arvioida koko schema-toteutus uudelleen.'),

  h2('8.4 Skaalaus uusiin kohteisiin'),
  p('Jos 3K laajenee uusiin kampuksiin tai palveluihin, järjestelmä on rakennettu skaalautumaan:'),
  bullet('Uudet kampukset: käytä Tag 3:n, 4:n ja 5:n @graph-rakenteita malliksi.'),
  bullet('Uudet palvelut: lisää uusia Layer 2 -tyyppisiä tageja vrt. Tagit 9—18.'),
  bullet('Uudet ravintolat: laajenna Tag 19:n @graph-rakennetta.'),
  bullet('Uudet koulutusohjelmat: lisää uusi EducationalOccupationalProgram-tagi Tagien 20—23 mallin mukaan.')
];

const section9 = [
  h1('9. Vastuut'),
  bulletBold('Tekninen ylläpito: ', 'Jussi Saarinen (3K ICT-asiantuntija) hoitaa GTM-päivitykset, schema-muutokset ja Search Console -seurannan.'),
  bulletBold('Sisällön päivitys: ', 'Sisältötiimi pitää Drupalin pääkuvat ja sivutiedot ajantasalla, jolloin schema-merkinnät päivittyvät automaattisesti.'),
  bulletBold('Strateginen seuranta: ', 'Yhteinen vastuu — Search Console -raporttien tarkistus säännöllisesti johtoryhmän kanssa.'),
  bulletBold('Konsultaatio: ', 'Schema-rakenteen suunnitteluun voidaan käyttää tekoälyä (esimerkiksi Claudea) apuvälineenä uusissa sivutyypeissä.')
];

const section10 = [
  h1('10. Yhteenveto'),
  p('Tämä projekti rakentaa pitkän aikavälin pohjan hakukonenäkyvyydelle kolmekampusta.fi-sivustolle. Hyödyt eivät näy hetkessä, mutta järjestelmä on huolellisesti suunniteltu kestämään aikaa ja skaalautumaan uusiin tarpeisiin.'),
  p('Kolme keskeistä asiaa muistettavaksi:'),
  numbered('Schema-tiedot välitetään Googlelle automaattisesti, mutta Google käyttää niitä omalla aikataulullaan. Kärsivällisyyttä tarvitaan.'),
  numbered('Sivustoa pitää päivittää huolellisesti, koska schema-data pohjautuu sivun varsinaiseen sisältöön. Strukturoitu data ei korvaa hyvää sisältöä.'),
  numbered('Uusia sivutyyppejä lisättäessä on syytä päivittää myös schema-toteutus, jotta hyöty jatkuu.'),
  blank(),
  p('Päivitykset onnistuvat ilman teknistä koodausta, joten järjestelmä on tarkoituksellisesti rakennettu yksinkertaiseksi ylläpitää ja laajentaa. Kaikki dokumentaatio löytyy projektikansiosta:'),
  bullet('gtm-tags-production.md — tekninen lähdekoodi'),
  bullet('information-roundup.md — kaikki tietosisältö selkokielisesti tarkistettavissa'),
  bullet('gtm-deployment-guide.md — käyttöönotto-ohje'),
  bullet('tags/-kansio — yksittäiset tagikoodit'),
  bullet('scripts/-kansio — testaustyökalut'),
  blank(),
  p('Kysymyksiä, kommentteja tai päivitystarpeita voi osoittaa Jussi Saariselle.', { run: { italics: true } })
];

// ============================================================
// DOCUMENT
// ============================================================

const doc = new Document({
  creator: 'Kolmen kampuksen urheiluopisto',
  title: 'Schema.org-strukturoidun datan toteutus — yhteenveto',
  description: 'kolmekampusta.fi-sivuston hakukonenäkyvyyden parantaminen',

  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial', color: '2F5496' },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '2F5496' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } }
    ]
  },

  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }] },
      { reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }] }
    ]
  },

  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Sivu ', size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '666666' }),
            new TextRun({ text: ' / ', size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '666666' })
          ]
        })]
      })
    },
    children: [
      ...titleBlock,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
      ...section6,
      ...section7,
      ...section8,
      ...section9,
      ...section10
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('seo-yhteenveto-suomeksi.docx', buffer);
  console.log('OK: seo-yhteenveto-suomeksi.docx created');
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
