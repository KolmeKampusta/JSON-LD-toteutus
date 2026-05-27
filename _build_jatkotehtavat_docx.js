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

// ============================================================
// CONTENT
// ============================================================

const titleBlock = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 360 },
    children: [new TextRun({ text: 'Hakukonenäkyvyyden jatkotehtävät', bold: true, size: 44 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: 'kolmekampusta.fi-sivuston SEO-kehityssuunnitelma', size: 28 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Jatkotyölista schema-toteutuksen jälkeen', italics: true, size: 24 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2400 },
    children: [new TextRun({ text: '27. toukokuuta 2026', size: 22 })]
  }),
  new Paragraph({ children: [new PageBreak()] })
];

const section1 = [
  h1('1. Mistä tässä dokumentissa on kyse?'),
  p('Schema.org-strukturoidun datan toteutus kolmekampusta.fi-sivustolle on saatu valmiiksi keväällä 2026. Toteutus muodostaa vahvan teknisen pohjan hakukoneoptimoinnille, mutta yksin se ei riitä. Hakukonenäkyvyys on monen tekijän summa, ja schema-data on vain yksi osa kokonaisuutta.'),
  p('Tämä dokumentti listaa kaikki keskeiset jatkotehtävät, joita kolmekampusta.fi-sivustolle kannattaa tehdä seuraavien 6-24 kuukauden aikana. Tehtävät on jaettu kiireellisyyden mukaan ja kirjoitettu siten, että johtoryhmä ja sisältötiimi voivat lukea sen ilman teknistä taustaa.'),
  p('Dokumentti on tarkoitettu työkaluksi suunnittelua varten - siitä voi valita, mihin osa-alueisiin keskitytään seuraavaksi ja missä järjestyksessä. Kaikkea ei tarvitse tehdä kerralla, eikä kaikki ole välttämättä edes tarpeellista. Lukijan tehtävä on valita ne kohdat, jotka sopivat Kolmen kampuksen tämänhetkisiin tavoitteisiin ja resursseihin.')
];

const section2 = [
  h1('2. Miksi nämä tehtävät ovat tärkeitä?'),
  p('Schema-toteutus auttaa Googlea ymmärtämään sivuston sisältöä. Mutta jotta hakukoneista oikeasti tulisi merkittävä kävijälähde, tarvitaan muutakin:'),
  bulletBold('Sisältöä, jota ihmiset etsivät. ', 'Schema ei tuo kävijöitä, jos sivustolla ei ole sitä, mitä haetaan.'),
  bulletBold('Teknistä laatua. ', 'Hidas, hankalakäyttöinen tai mobiilissa rikkinäinen sivusto karkottaa kävijät ja saa Googlen siirtämään sen alaspäin tuloksissa.'),
  bulletBold('Luotettavuutta. ', 'Muiden sivustojen linkit, asiakasarviot ja Google Business Profile -tiedot vahvistavat luottamusta.'),
  bulletBold('Mittausta. ', 'Ilman seurantaa ei tiedetä, mikä toimii ja mikä ei. Konversiotavoitteet pitää määritellä ja mitata.'),
  blank(),
  p('Yhdessä nämä muodostavat kokonaisuuden, jossa schema-toteutus on yksi tärkeä rakennuspala mutta ei ainoa.'),
  p('Seuraavat luvut käsittelevät jatkotehtävät kiireellisyysjärjestyksessä. Luvun 3 asiat suositellaan käynnistettäväksi heti, luvun 4 asiat seuraavan puolen vuoden aikana ja luvut 5-7 pidemmän tähtäimen kehityksenä.')
];

const section3 = [
  h1('3. Kriittinen prioriteetti (3-6 kuukautta)'),
  p('Nämä kolme tehtävää suositellaan aloitettavaksi heti schema-toteutuksen julkaisun jälkeen. Ne tuovat suurimman hyödyn pienimmällä työmäärällä ja tukevat schema-toteutuksen vaikutusta.'),

  h2('3.1 Google Business Profile -tietojen ajantasaistaminen'),
  p('Google Business Profile (entinen Google My Business) on Googlen ilmainen palvelu, jonka kautta yritys voi hallita näkyvyyttään Google-hauissa ja Google Mapsissa. Jokaisella kolmella kampuksella (Pajulahti, Kisakallio ja Mäkelänrinne) tulisi olla oma erillinen profiilinsa, koska kyseessä on kolme eri fyysistä toimipistettä.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Tarkista, että jokaisella kampuksella on oma Google Business Profile -tili.'),
  bullet('Päivitä aukioloajat, puhelinnumerot, osoitteet ja verkkosivuosoitteet samoiksi kuin schema-merkinnöissä.'),
  bullet('Lisää korkealaatuisia valokuvia kampuksen tiloista, ravintoloista, majoituksesta ja ulkoalueista. Suositus on vähintään 20 valokuvaa per kampus.'),
  bullet('Lisää tarjotut palvelut ja tuotteet (esimerkiksi majoitus, ravintola, liikuntatilojen vuokraus, kurssit).'),
  bullet('Aktivoi viestintätoiminto, jotta asiakkaat voivat lähettää kysymyksiä suoraan profiilin kautta.'),
  blank(),
  p('Tärkeintä on, että Google Business Profilen tiedot ovat täsmälleen samat kuin sivuston schema-merkinnöissä. Pienikin ristiriita (esimerkiksi eri osoitemerkintä) heikentää Googlen luottamusta tietojen oikeellisuuteen.'),
  p('Arvioitu työmäärä: 4-6 tuntia per kampus alkuvaiheessa, sen jälkeen tunti kuukaudessa ylläpitoon.'),

  h2('3.2 Core Web Vitals - sivuston teknisen suorituskyvyn parantaminen'),
  p('Core Web Vitals on Googlen virallinen mittari sivuston käyttökokemuksen laadulle. Se mittaa kolmea asiaa:'),
  bulletBold('LCP (Largest Contentful Paint). ', 'Kuinka nopeasti sivun suurin elementti latautuu. Tavoite alle 2,5 sekuntia.'),
  bulletBold('INP (Interaction to Next Paint). ', 'Kuinka nopeasti sivu reagoi käyttäjän klikkauksiin ja näppäimistösyötteisiin. Tavoite alle 200 millisekuntia.'),
  bulletBold('CLS (Cumulative Layout Shift). ', 'Kuinka paljon sivun sisältö hyppii latauksen aikana. Tavoite alle 0,1.'),
  blank(),
  p('Google käyttää näitä mittareita yhtenä hakusijoituksen muodostavana tekijänä. Jos sivusto on hidas tai hankala käyttää mobiililaitteilla, se laskee hakusijoitusta - vaikka schema-data olisi täydellinen.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  numbered('Aja PageSpeed Insights -testi (https://pagespeed.web.dev/) kolmelle keskeiselle sivulle: etusivu, kampuksen etusivu ja yksittäisen tapahtuman sivu.'),
  numbered('Kirjaa nykyiset tulokset talteen lähtötason vertailua varten.'),
  numbered('Tunnista suurimmat ongelmat raportin perusteella - yleisimpiä ovat optimoimattomat kuvat, liian suuret JavaScript-tiedostot ja hitaat verkkofonttilataukset.'),
  numbered('Kerää korjaustarpeet selkeäksi listaksi ja toimita ne Druidille.'),
  numbered('Mittaa uudelleen kuukauden kuluttua korjauksista ja vertaa lähtötasoon.'),
  blank(),
  p('Erityishuomio mobiilikäyttöön: Suurin osa kolmekampusta.fi-sivuston kävijöistä todennäköisesti käyttää sivustoa puhelimella. Mobiilisuorituskyky on siksi tärkeämpi kuin pöytäkoneella mitattu.'),

  h2('3.3 Asiakasarvioiden kerääminen ja hyödyntäminen'),
  p('Asiakasarviot Google Business Profilessa ovat yksi tärkeimmistä tekijöistä, jotka vaikuttavat siihen, valitseeko hakija sivuston tuloksista. Useamman tähden ja tuoreen palautteen omaava profiili saa enemmän klikkauksia kuin samalla sijalla oleva profiili ilman arvioita.'),
  p('Tärkeä huomio: schema-merkinnöissä ei käytetä aggregateRating- tai Review-merkintöjä, koska niiden käyttäminen yhdessä DigitalGuest-arvostelujärjestelmän kanssa on Googlen ohjeiden vastaista. Arviot kerätään ja näytetään Google Business Profilen kautta, ei sivuston schema-datana.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Luo systemaattinen prosessi arvioiden pyytämiseen tapahtuman, leirin tai majoituksen jälkeen.'),
  bullet('Käytä esimerkiksi automaattista sähköpostia, jossa on suora linkki arvion antamiseen.'),
  bullet('Vastaa kaikkiin arvioihin - sekä positiivisiin että negatiivisiin - ammatillisesti ja kiitollisesti.'),
  bullet('Tähtää vähintään yhteen uuteen arvioon viikossa per kampus.'),
  blank(),
  p('Negatiiviset arviot eivät ole katastrofi, kunhan niihin vastataan asiallisesti ja ratkaisukeskeisesti. Ne osoittavat, että yritys on aito ja että palautteeseen reagoidaan.')
];

const section4 = [
  h1('4. Keskeinen prioriteetti (6-12 kuukautta)'),
  p('Näitä tehtäviä voi aloittaa, kun luvun 3 perustyö on käynnissä. Ne vaativat hieman enemmän työtä ja vakiintuneempaa prosessia, mutta tuovat merkittäviä tuloksia keskipitkällä aikavälillä.'),

  h2('4.1 Avainsanatutkimus ja sisältöstrategia'),
  p('Avainsanatutkimus tarkoittaa sen selvittämistä, mitä hakusanoja kohderyhmä käyttää Google-hauissa. Vasta kun nämä tiedetään, sivuston sisältöä voidaan kehittää siten, että se vastaa kysyntään.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  numbered('Kartoita kaikki olennaiset hakusanat Kolmen kampuksen palveluihin liittyen. Esimerkkejä: "urheiluleiri Pajulahti", "majoitus Lahti urheilu", "valmentajakoulutus Suomi", "korkeanpaikan harjoittelu Suomi", "uimahalli Nastola".'),
  numbered('Käytä apuna Google Search Console -työkalua: katso, millä hakusanoilla sivustolla jo nyt vieraillaan ja millä hakusanoilla sivusto näkyy hakutuloksissa mutta saa vähän klikkauksia.'),
  numbered('Tunnista hakusanat, joille sivustolla ei vielä ole hyvää vastausta. Nämä ovat sisältöaukkoja.'),
  numbered('Luo sisältökalenteri, jossa määritellään, mitkä sisältöaukot täytetään seuraavien kuukausien aikana ja kuka kirjoittaa.'),
  blank(),
  p('Suositeltava aloitusrytmi: yksi syvällinen artikkeli tai opassivu kuukaudessa. Laatu on tärkeämpää kuin määrä - yksi todella hyvä artikkeli tuo enemmän kävijöitä kuin kymmenen pinnallista.'),
  p('Ulkoinen apu: avainsanatutkimukseen voi tilata erillisen kartoituksen hakukoneoptimointiin erikoistuneelta toimistolta. Hinta on tyypillisesti 1 500-4 000 euroa, ja tulokset palvelevat useamman vuoden ajan.'),

  h2('4.2 Englanninkielinen sisältö'),
  p('Kolme kampusta toimii kansainvälisessä ympäristössä: kansainväliset urheilijat osallistuvat leireihin, ulkomaiset valmentajat osallistuvat koulutuksiin ja korkeanpaikan harjoittelu vetää puoleensa kansainvälisiä huippu-urheilijoita. Suomenkielinen sivusto rajaa nämä kohderyhmät pois.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Käännä keskeiset sivut englanniksi: etusivu, kampusten esittelyt, korkeanpaikan harjoittelu, valmentajakoulutus, kansainväliset palvelut.'),
  bullet('Käytä Drupalin kielitukea - älä luo erillistä englanninkielistä sivustoa, vaan integroi käännökset olemassa olevaan rakenteeseen (hreflang-merkintöjen kanssa).'),
  bullet('Päivitä schema-merkinnät tukemaan myös englanninkielistä sisältöä - lisää inLanguage-kentät tarvittaessa.'),
  bullet('Älä käytä konekäännöksiä sellaisenaan. Käytä ammattikääntäjää tai vähintään natiivipuhujan oikolukua.'),
  blank(),
  p('Tämä on isompi investointi (arviolta 8 000-15 000 euroa käännöksiin riippuen sivumäärästä), mutta avaa kokonaan uuden markkinan.'),

  h2('4.3 Konversioseuranta'),
  p('Konversio tarkoittaa toimintoa, jonka halutaan tapahtuvan sivustolla: yhteydenottolomakkeen lähetys, majoitusvarauksen aloitus, koulutuksen hakulinkin klikkaus tai uutiskirjeen tilaus. Ilman konversioseurantaa ei tiedetä, mitkä sivut tuovat tulosta ja mitkä eivät.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  numbered('Listaa kaikki halutut konversiot. Yhteydenottolomakkeen lähetys, varauslinkin klikkaus Willbaan, koulutushakemuksen avaaminen, ladattujen oppaiden määrä ja niin edelleen.'),
  numbered('Määrittele jokaiselle konversiolle arvo. Vaikka arvo olisi karkea arvio (esimerkiksi keskimääräisen majoitusvarauksen arvo), se mahdollistaa sivuston tuottavuuden seurannan.'),
  numbered('Asenna konversioseuranta Google Analyticsin ja Google Tag Managerin kautta - molemmat ovat jo käytössä.'),
  numbered('Luo Google Analyticsissa raportti, joka näyttää, mistä lähteistä konversiot tulevat: orgaaninen haku, maksettu mainonta, sosiaalinen media vai suora liikenne.'),
  blank(),
  p('Ilman konversioseurantaa kaikki muu SEO-työ on osittain sokkona toimimista. Tämä on yksi tärkeimmistä yksittäisistä tehtävistä.'),

  h2('4.4 Sisäinen linkitys'),
  p('Sisäinen linkitys tarkoittaa sivuston sisäisiä linkkejä sivulta toiselle. Hyvä sisäinen linkitys auttaa sekä käyttäjiä että hakukoneita löytämään olennaista sisältöä. Schema-data kuvaa entiteettien suhteet hakukoneille, mutta käyttäjille ja Googlebot-indeksoijalle linkitys on tärkein navigointitapa.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Käy läpi kaikki keskeiset sivut ja varmista, että ne linkittävät vähintään kahteen muuhun aiheeseen liittyvään sivuun.'),
  bullet('Lisää aiheeseen liittyvät palvelut -laatikot palvelusivuille (esimerkiksi majoitussivulla linkit lähikampuksen ravintoloihin ja liikuntatiloihin).'),
  bullet('Käytä kuvaavia linkkitekstejä - vältä "klikkaa tästä" tai "lue lisää", käytä kuvauksia kuten "Lue lisää korkeanpaikan harjoittelusta".'),
  bullet('Luo aihealueista kokoavia opassivuja, jotka linkittävät kaikkiin asiaan liittyviin yksityiskohtaisiin sivuihin.'),

  h2('4.5 Linkkistrategia ja maine verkossa'),
  p('Linkit muilta sivustoilta (englanniksi "backlinks") ovat edelleen yksi Googlen tärkeimmistä luottamussignaaleista. Mitä useammalta laadukkaalta sivustolta tulee linkkejä, sitä luotettavammaksi Google katsoo sivuston.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Kartoita nykytilanne: mistä sivustoista kolmekampusta.fi-sivustolle jo linkitetään. Käytä esimerkiksi Google Search Console -työkalun "Linkit"-raporttia.'),
  bullet('Tunnista luonnolliset kumppanit, joiden kanssa voisi vaihtaa linkkejä: lajiliitot, urheiluseurat, Lahden alueen matkailusivustot ja Olympiakomitea.'),
  bullet('Pyydä mediassa ilmestyvissä artikkeleissa, että jutuissa olisi linkki sivustolle. Tämä on yleinen käytäntö, mutta jää usein tekemättä, jos sitä ei erikseen pyydetä.'),
  bullet('Vieraskirjoittaminen: tarjoa asiantuntija-artikkeleita muille urheiluun ja koulutukseen liittyville sivustoille, joissa tekijän esittelyssä on linkki kolmekampusta.fi-sivustolle.'),
  blank(),
  p('Huomio: älä osta linkkejä epäilyttäviltä palveluilta. Google rankaisee tällaisesta linkkimanipulaatiosta. Linkkien hankinta on hidasta ja vaatii kärsivällisyyttä, mutta tulokset kestävät vuosia.')
];

const section5 = [
  h1('5. Schema-laajennukset (pidempi aikaväli)'),
  p('Schema-toteutusta voidaan laajentaa, kun sivustolle tulee uusia sisältötyyppejä tai kun nykyisiä halutaan tarkentaa. Alla on lista tunnistettuja laajennusmahdollisuuksia. Lisätietoja toteutuksen periaatteista löytyy schema-yhteenvetodokumentista (seo-yhteenveto-suomeksi.docx) luvusta 8.'),

  h2('5.1 JobPosting - avoimet työpaikat Google for Jobsissa'),
  p('Avoimet työpaikat kannattaa merkitä JobPosting-merkinnällä, joka mahdollistaa työpaikkailmoitusten näkymisen Google for Jobs -palvelussa. Tämä on yksi tehokkaimmista nykyisistä rikkaiden tulosten muodoista, ja Google näyttää työpaikkailmoituksia hakutulosten yläosassa erillisellä alueella.'),
  p('Edellytys: avoimet työpaikat täytyy julkaista jollain pysyvällä sivulla sivustolla (esimerkiksi /tyopaikat/avoimet/{työpaikan-nimi}). Pelkät PDF-ilmoitukset eivät toimi.'),
  p('Hyödyt rekrytointiin ovat merkittäviä - lisää laadukkaita hakemuksia ilman lisämaksua rekrytointialustoille.'),

  h2('5.2 CollectionPage-merkinnät kokoaville listaussivuille'),
  p('Listaussivut kuten "Kaikki tapahtumat", "Kaikki koulutukset" tai "Kaikki blogit" hyötyvät CollectionPage-merkinnästä, joka kertoo Googlelle, että kyseessä on koonti tietyntyyppisistä sisällöistä. Tämä parantaa sivuston rakenteen ymmärtämistä ja voi vaikuttaa siihen, miten Google ryhmittelee tuloksia.'),
  p('Yhdessä ItemList-merkinnän kanssa listaussivut voivat näkyä Googlessa rikkaampina tuloksina.'),

  h2('5.3 hasCourse-rakenne yksittäisille kursseille'),
  p('Nykyiset koulutusohjelmamerkinnät (tagit 20-23) kuvaavat koulutusohjelmat ylätasolla. Jos halutaan kuvata yksittäiset kurssit tarkemmin (esimerkiksi "Lasten liikunnan ohjaajakurssi" tai "Personal Trainer -koulutus"), kannattaa lisätä hasCourse-suhteet ja kuvata kurssit Course-tyypillä.'),
  p('Tämä tarkentaa Googlen entiteettiymmärrystä ja antaa pohjan koulutushakujen rikkaammille tuloksille, kun Google laajentaa Education-rikkaita tuloksia Suomeen.'),

  h2('5.4 ApplyAction-laajennus hakulomakkeisiin'),
  p('Jos koulutusohjelmiin ja työpaikkoihin lisätään ApplyAction-merkintä, Google saa tarkan tiedon siitä, missä hakulomake sijaitsee. Tämä voi parantaa konversioiden seurattavuutta ja näkyvyyttä.'),

  h2('5.5 Yksittäiset rakennukset ja tilat'),
  p('Nykyiset kampusmerkinnät kuvaavat koko kampuksen yhtenä kokonaisuutena. Jos halutaan tarkentaa rakennustasolle (esimerkiksi "Pajulahti Areena" tai "Susi Training Center"), näille voidaan tehdä omat Place- tai SportsActivityLocation-merkintänsä. Tämä parantaa erityisesti tilavuokraukseen liittyvien hakujen näkyvyyttä.'),

  h2('5.6 Lisäravintoloiden ja kahviloiden merkinnät'),
  p('Jos jokin kampuksilla toimiva ravintola tai kahvila puuttuu nykyisestä tagista 19, se kannattaa lisätä. Tämä parantaa erityisesti paikallisten hakujen ("ravintola Pajulahti") näkyvyyttä Google Mapsissa.'),

  h2('5.7 Valmennuskeskus ja Susi Training Center'),
  p('Valmennuskeskus ja Susi Training Center ovat tunnistettavia kokonaisuuksia, jotka ansaitsevat omat schema-merkintänsä. Suosituksena on SportsActivityLocation- tai LocalBusiness-merkintä, joka linkitetään ylätason organisaatioon parentOrganization-suhteella.'),

  h2('5.8 Digikampus - verkkokoulutusalusta'),
  p('Kun digitaalinen oppimisalusta julkaistaan, sille kannattaa lisätä oma EducationalOccupationalProgram- tai Course-merkintä. Mahdollisesti hyödynnetään myös LearningResource-tyyppiä yksittäisiä oppimateriaaleja varten. Tämä parantaa digitaalisten kurssien löydettävyyttä hakutuloksista.'),

  h2('5.9 Sporttivuokraamo'),
  p('Jos Sporttivuokraamo on erillinen, keskitetty vuokrauspalvelu, sille kannattaa luoda oma Service- tai Store-tyyppinen merkintä. Se tarkentaa nykyistä väline- ja kenttävuokraus-merkintää (tagi 18). Tarvittaessa myös OfferCatalog-merkintä, jossa luetellaan vuokrattavat välineet ja kentät hintatietojen kanssa.')
];

const section6 = [
  h1('6. Tekninen ylläpito ja saavutettavuus'),
  p('Tekninen kunto on hakukoneoptimoinnin perusta. Vaikka schema-data olisi täydellinen ja sisältö huippulaatua, tekniset ongelmat heikentävät näkyvyyttä. Seuraavat tehtävät tukevat sekä SEO:ta että käyttäjäkokemusta.'),

  h2('6.1 404-virheiden seuranta'),
  p('404-virheitä syntyy, kun käyttäjä yrittää avata sivun, jota ei enää ole olemassa (esimerkiksi vanha tapahtumasivu, joka on poistettu). Liiallinen 404-virheiden määrä heikentää käyttökokemusta ja hakukonenäkyvyyttä.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Seuraa Google Search Console -työkalun "Indeksointi"-raporttia kuukausittain.'),
  bullet('Aseta uudelleenohjaukset (301-redirect) tärkeimmistä poistuneista sivuista vastaaviin uusiin sivuihin.'),
  bullet('Jos sivulla ei ole järkevää korvaajaa, jätä se 404-tilaan eikä ohjaa etusivulle (etusivulle ohjaaminen on huono käytäntö, jota Google ei suosittele).'),

  h2('6.2 WCAG-saavutettavuus'),
  p('WCAG (Web Content Accessibility Guidelines) on kansainvälinen saavutettavuusstandardi, joka koskee Suomessa julkisia toimijoita lain mukaan. Kolme kampusta on osittain julkisrahoitteinen toimija, joten saavutettavuus on otettava huomioon.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Tarkista, että kaikilla kuvilla on alt-teksti, joka kuvaa kuvan sisällön.'),
  bullet('Varmista, että sivustolla pystyy navigoimaan pelkällä näppäimistöllä.'),
  bullet('Tarkista, että tekstien ja taustojen värikontrasti on riittävä (vähintään 4,5:1 normaalille tekstille).'),
  bullet('Käytä WAVE-työkalua (https://wave.webaim.org/) keskeisten sivujen tarkastukseen.'),
  blank(),
  p('Saavutettavuus parantaa myös hakukonenäkyvyyttä, koska se pakottaa kirjoittamaan selkeitä alt-tekstejä, kuvaavia linkkitekstejä ja loogisia otsikkorakenteita - kaikkia tekijöitä, jotka Google arvostaa.'),

  h2('6.3 robots.txt ja sitemap.xml'),
  p('robots.txt on tiedosto, joka ohjaa hakukoneita siihen, mitkä sivuston osat saa indeksoida. sitemap.xml on lista kaikista sivuston tärkeistä sivuista. Molemmat ovat keskeisiä hakukoneindeksoinnin ohjaamisessa.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Tarkista, että sitemap.xml on ajan tasalla ja sisältää kaikki olennaiset sivut.'),
  bullet('Tarkista, että robots.txt ei estä mitään tärkeää (esimerkiksi /palvelut/ tai /kampukset/).'),
  bullet('Lähetä sitemap.xml Search Consoleen, jotta Google löytää uudet sivut nopeammin.'),

  h2('6.4 URL-aliakset ja kanoniset osoitteet'),
  p('Jos saman sisällön voi avata useammalla URL-osoitteella (esimerkiksi suomeksi ja englanniksi tai eri parametreilla), Google saattaa pitää niitä eri sivuina ja jakaa niiden välistä hakuvoimaa. Kanoninen tunniste (rel="canonical") ohjaa Googlea siihen, mikä on sivun "oikea" osoite.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Tarkista, että jokaisella sivulla on kanoninen tunniste, joka osoittaa oikeaan kanoniseen URL-osoitteeseen.'),
  bullet('Varmista, että URL-rakenne on johdonmukainen - esimerkiksi käytetäänkö aina www-etuliitettä vai ei, käytetäänkö loppukauttaviivaa vai ei.'),
  bullet('Jos sivustolla otetaan käyttöön englanninkielinen sisältö, lisää hreflang-merkinnät, jotta Google tarjoaa oikean kielisen version oikealle kohderyhmälle.')
];

const section7 = [
  h1('7. Strateginen näkymä'),
  p('Nämä tehtävät eivät ole välttämättömiä lyhyellä aikavälillä, mutta auttavat säilyttämään ja vahvistamaan Kolmen kampuksen hakukonenäkyvyyttä pitkällä aikavälillä. Ne sopivat erityisesti tilanteeseen, jossa perusasiat (luvut 3 ja 4) ovat jo kunnossa.'),

  h2('7.1 Kilpailija-analyysi'),
  p('On hyödyllistä tietää, miten muut urheiluopistot ja vastaavat palveluntarjoajat näkyvät Google-hauissa. Suoria kilpailijoita ovat esimerkiksi Vierumäki, Kuortane ja Eerikkilä. Lisäksi koulutuspuolella kilpailua tulee ammattikorkeakouluilta ja urheiluseurojen omilta koulutusohjelmilta.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Listaa 5-10 keskeistä kilpailijaa.'),
  bullet('Hae kilpailijoiden palveluja Googlesta ja tutki, miten ne näkyvät hakutuloksissa.'),
  bullet('Käytä SEO-työkalua (esimerkiksi Ahrefs tai Semrush) kilpailijoiden hakusanojen ja linkkien selvittämiseen.'),
  bullet('Tunnista, mille hakusanoille kilpailijat löytyvät mutta Kolme kampusta ei - nämä ovat mahdollisia sisältöaukkoja.'),
  blank(),
  p('Kilpailija-analyysiä ei tarvitse tehdä joka kvartaali - kerran vuodessa riittää, ellei kilpailutilanne muutu merkittävästi.'),

  h2('7.2 Hakuintention kartoitus'),
  p('Hakuintentio tarkoittaa sitä, mitä käyttäjä todella haluaa, kun hän kirjoittaa tietyn hakusanan. Esimerkiksi haku "uimahalli Lahti" voi tarkoittaa: missä on uimahalli, mikä on aukioloaika, paljonko maksaa pääsy, voiko sinne tulla ilman kortin ostamista. Sivuston pitää tarjota vastaus juuri siihen kysymykseen, jonka käyttäjä halusi kysyä.'),
  p('Tarkkaile Google Search Console -työkalusta:'),
  bullet('Mitkä hakusanat tuovat liikennettä, mutta klikkausprosentti on matala? - Otsikko ja kuvaus eivät vastaa hakuintentiota.'),
  bullet('Mitkä sivut saavat paljon näyttökertoja, mutta vähän klikkauksia? - Sivun sisältö ei kohtaa hakijan tarvetta.'),
  bullet('Mitkä hakusanat tuovat klikkauksia, mutta käyttäjät poistuvat nopeasti? - Sivu ei vastaa odotuksiin.'),
  blank(),
  p('Korjaa sisältöjä havaintojen pohjalta. Pieni otsikon tai johdantokappaleen muutos voi kasvattaa klikkausprosenttia merkittävästi.'),

  h2('7.3 Tekoälyhakujen optimointi (AI-haut)'),
  p('Vuonna 2026 yhä useammat käyttäjät hakevat tietoa tekoälypohjaisista palveluista (Google AI Overviews, ChatGPT, Perplexity, Claude). Nämä palvelut hyödyntävät usein samoja schema-merkintöjä kuin Google-haku, mutta esittävät tietoa eri tavalla - usein suoraan vastauksena, ei klikkauslinkkinä.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Kirjoita sisältöä, joka vastaa selkeisiin kysymyksiin suoraan. Esimerkiksi: "Mitä koulutuksia Pajulahti tarjoaa?" tai "Paljonko maksaa Susi Training Centerin vuokraus?"'),
  bullet('Käytä selkeitä otsikkohierarkioita ja lyhyitä, ytimekkäitä kappaleita - tekoäly poimii vastauksiaan helposti niistä.'),
  bullet('Varmista, että keskeiset faktat (osoitteet, hinnat, aukioloajat) ovat tekstissä eikä vain kuvissa tai PDF-tiedostoissa.'),
  bullet('Schema-merkinnät auttavat myös tekoälyä, koska useimmat tekoälypalvelut hyödyntävät niitä tietolähteenä.'),
  blank(),
  p('Tekoälyhakujen merkitys kasvaa nopeasti, ja sivustot, jotka ovat valmiiksi optimoituja, hyötyvät enemmän. Hakukoneoptimoinnin perusteet (selkeä rakenne, hyvä sisältö, schema-data) palvelevat sekä perinteistä Google-hakua että tekoälyä.'),

  h2('7.4 Sisältökalenteri ja säännöllinen julkaisu'),
  p('Hakukoneet suosivat sivustoja, jotka päivittyvät säännöllisesti. Sivusto, jossa ei tapahdu mitään puoleen vuoteen, vaikuttaa Googlen silmissä epäaktiiviselta ja menettää hitaasti näkyvyyttään.'),
  p('Mitä konkreettisesti pitää tehdä:'),
  bullet('Luo sisältökalenteri, jossa määritellään seuraavan kuuden kuukauden julkaisut.'),
  bullet('Tavoittele vähintään 2-4 uutta sisältöjulkaisua kuukaudessa (blogit, uutiset, opastavat artikkelit).'),
  bullet('Käytä avainsanatutkimuksen tuloksia (luku 4.1) aiheiden valinnassa.'),
  bullet('Pidä sisällön laatu korkeana - yksi hyvin tehty artikkeli kuukaudessa on parempi kuin neljä pinnallista.'),
  blank(),
  p('Sisällöntuottaminen on jatkuvaa työtä, joka vaatii erillisen vastuuhenkilön tai ulkoistetun kumppanin. Jos resursseja ei ole, kannattaa keskittyä laadukkaisiin opassivuihin (englanniksi "pillar content"), jotka ovat ajattomia ja palvelevat vuosia.')
];

const section8 = [
  h1('8. Top-3 ensisijaiset tehtävät'),
  p('Jos resursseja on rajallisesti ja kaikkia tämän dokumentin tehtäviä ei voida tehdä, suosittelemme aloittamaan näistä kolmesta:'),

  h2('Tehtävä 1: Google Business Profile -tietojen päivitys'),
  p('Tämä on nopein hyöty pienimmällä työmäärällä. Suorat tulokset näkyvät paikallishauissa (Google Maps -tulokset) muutamassa viikossa. Arvioitu työmäärä: 12-18 tuntia alkuvaiheessa, sen jälkeen 1-2 tuntia kuukaudessa per kampus.'),

  h2('Tehtävä 2: Konversioseuranta'),
  p('Ilman konversioseurantaa kaikki muu SEO-työ on osittain sokkona toimimista. Pitää tietää, mitä sivuilta halutaan ja mitkä sivut tuovat tulosta. Arvioitu työmäärä: 8-16 tuntia alkukonfigurointi, sen jälkeen tunti kuukaudessa raporttien tarkasteluun.'),

  h2('Tehtävä 3: Core Web Vitals -korjaukset'),
  p('Tekninen suorituskyky vaikuttaa sekä hakusijoitukseen että käyttäjäkokemukseen. Jos sivusto on hidas, kaikki muu työ jää vajaaksi. Arvioitu työmäärä: 4 tuntia mittaukseen ja korjaustarpeiden tunnistamiseen, sen jälkeen Druidin työ varsinaisten korjausten tekemiseen (kustannus riippuu löydetyistä ongelmista).'),

  blank(),
  p('Nämä kolme tehtävää muodostavat yhdessä vahvan perustan, jonka päälle kaikki muu SEO-työ rakentuu. Niiden jälkeen voidaan siirtyä luvun 4 keskipitkän aikavälin tehtäviin.')
];

const section9 = [
  h1('9. Vastuut ja yhteistyö'),
  p('Hakukoneoptimointi on monen toimijan yhteistä työtä. Vastuita kannattaa selkeyttää alusta alkaen, jotta tehtävät eivät jää tekemättä.'),
  bulletBold('Tekninen ylläpito: ', 'Jussi Saarinen (Kolmen kampuksen ICT-asiantuntija) vastaa schema-toteutuksen ylläpidosta, Search Console -seurannasta ja teknisistä SEO-tehtävistä.'),
  bulletBold('Sisältötiimi: ', 'Sisällöntuotanto, avainsanatutkimuksen hyödyntäminen sisällössä, blogien ja uutisten julkaisu, sisältökalenterin ylläpito.'),
  bulletBold('Markkinointi/viestintä: ', 'Google Business Profile -tilien ylläpito, asiakasarvioiden pyytäminen ja niihin vastaaminen, linkkikumppanuuksien hoitaminen.'),
  bulletBold('Johtoryhmä: ', 'Strateginen seuranta - kvartaaleittain käytävä SEO-katsaus, jossa arvioidaan tuloksia ja päätetään seuraavista panostuksista.'),
  bulletBold('Druid (tekninen toteuttaja): ', 'Suuremmat tekniset muutokset (Core Web Vitals -korjaukset, Drupalin kielituki, URL-rakenteen muutokset) tilataan Druidilta tarpeen mukaan.'),
  bulletBold('Ulkoiset kumppanit: ', 'Avainsanatutkimukseen, käännöksiin tai laajempiin SEO-auditointeihin kannattaa harkita ulkoista asiantuntijaa.'),
  blank(),
  p('Onnistumisen kannalta tärkeintä on, että SEO-työ ei jää yksittäisen henkilön harteille vaan on osa organisaation jatkuvaa toimintaa.')
];

const section10 = [
  h1('10. Loppusanat'),
  p('Schema-toteutus on rakentanut vahvan teknisen pohjan kolmekampusta.fi-sivuston hakukonenäkyvyydelle. Se on kuitenkin vasta alku - pitkän aikavälin tuloksia syntyy vasta, kun teknistä toteutusta tukee sisältö, käyttökokemus ja jatkuva ylläpito.'),
  p('Tämä dokumentti on tarkoitettu työkaluksi, ei pakollisten tehtävien listaksi. Valitse ne kohdat, jotka palvelevat Kolmen kampuksen strategiaa ja resursseja parhaiten. Pieni mutta säännöllinen panostus tuottaa paremman tuloksen kuin yksittäinen suuri ponnistus.'),
  p('Tärkein periaate: hakukoneoptimointi ei ole projekti, jolla on alku ja loppu. Se on jatkuvaa työtä, joka tuottaa tuloksia kärsivällisyydellä ja systemaattisuudella. Vuosi-kahden päästä tämän dokumentin tehtävät on syytä päivittää, koska sekä Googlen algoritmit että Kolmen kampuksen tarpeet ovat ehtineet muuttua.'),
  blank(),
  p('Liittyvät dokumentit:'),
  bullet('seo-yhteenveto-suomeksi.docx - schema-toteutuksen yhteenveto'),
  bullet('gtm-tags-production.md - tekninen lähdekoodi'),
  bullet('information-roundup.md - sivuston schema-tiedot selkokielisesti'),
  bullet('gtm-deployment-guide.md - käyttöönotto-ohje'),
  blank(),
  p('Kysymyksiä, kommentteja tai päivitystarpeita voi osoittaa Jussi Saariselle.', { run: { italics: true } })
];

const section11 = [
  h1('11. Konversioseuranta käytännössä'),
  p('Kolmekampusta.fi-sivustolla ei ole verkkokauppaa eikä suoraa myyntiä. Varsinainen liiketoiminta tapahtuu sivuston ulkopuolella: majoitusvaraukset Willbassa, kurssihakemukset hakulomakkeissa ja yritystarjousten valmistelu sähköpostitse tai puhelimitse. Tämä ei tarkoita, että konversioita ei voida seurata - se tarkoittaa, että konversion määritelmä on hieman erilainen kuin verkkokauppasivustolla.'),
  p('Tämän luvun tarkoituksena on tarkentaa, mitä Kolmen kampuksen verkkosivustolla kannattaa konkreettisesti mitata, miten konversioille annetaan taloudellinen arvo ja miten seuranta otetaan käyttöön. Tämä luku täydentää luvun 4.3 yleisemmän tason ohjeistusta.'),

  h2('11.1 Mitä konversiot ovat tällä sivustolla?'),
  p('Kolmekampusta.fi-sivuston konversiot ovat pääasiassa niin sanottuja liidikonversioita, eli vahvoja ostoaikomuksen signaaleja, jotka eivät vielä ole varsinaisia ostoja. Ne jakautuvat viiteen luokkaan.'),

  h3('A) Lomakelähetykset - helpoin ja tärkein'),
  bullet('Yhteydenottolomakkeen lähetys'),
  bullet('Ilmoittautumislomakkeet (kursseille, leireille, tapahtumiin)'),
  bullet('Uutiskirjeen tilaus'),
  bullet('Esitepyyntölomakkeet'),
  bullet('Tarjouspyyntölomakkeet (yritysasiakkaat, tilavuokraus)'),
  blank(),
  p('GTM tunnistaa lomakelähetyksen automaattisesti "Form Submission" -liipaisimella, kunhan lomakkeessa on standardimuotoinen submit-tapahtuma. Drupalin webform-moduulin kanssa tämä toimii suoraan ilman erillistä koodausta.'),

  h3('B) Ulkoiset varaus- ja hakulinkit - toiseksi tärkein'),
  p('Jokainen klikkaus ulkoiseen järjestelmään on vahva ostoaikomuksen signaali:'),
  bullet('Klikki Willba-varaussivulle (Pajulahti ja Kisakallio)'),
  bullet('Klikki koulutushakemukseen (opintopolku.fi tai Kolmen kampuksen oma hakulomake)'),
  bullet('Klikki DigitalGuest-palautejärjestelmään'),
  bullet('Klikki ulkoisten kumppaneiden sivustoille (esimerkiksi tapahtumien lippukauppaan)'),
  blank(),
  p('Toteutus GTM:ssä on "Click - Just Links" -liipaisin, jossa ehtona on Click URL contains "willba.fi" tai vastaava. Tämä on jo nyt teknisesti mahdollista, koska GTM-säiliö on käytössä schema-toteutuksen myötä.'),

  h3('C) Suorat yhteydenottoklikit'),
  p('Erityisesti mobiilissa nämä ovat tärkeitä konversioita:'),
  bullet('Klikki puhelinnumeroon (linkki, jossa href alkaa "tel:")'),
  bullet('Klikki sähköpostiosoitteeseen (linkki, jossa href alkaa "mailto:")'),
  blank(),
  p('Mobiilikäyttäjälle puhelinklikki tarkoittaa lähes aina puhelua, eli korkean ostoaikomuksen signaalia.'),

  h3('D) Tiedostolataukset'),
  bullet('Esitteet (PDF)'),
  bullet('Kurssikuvaukset (PDF)'),
  bullet('Hakemuslomakkeet (PDF)'),
  bullet('Tilaesitteet (PDF)'),
  blank(),
  p('GTM:ssä liipaisin on "Click URL ends with .pdf". Tiedoston ladannut käyttäjä on tyypillisesti pidemmälle harkinneessa vaiheessa.'),

  h3('E) Avainsivuille pääseminen'),
  p('Joskus tärkein konversio on, että käyttäjä yleensäkin löytää tietyn sivun:'),
  bullet('Vierailu hinnastosivulla'),
  bullet('Vierailu yhteystiedoissa'),
  bullet('Vierailu hakuajat-sivulla'),
  blank(),
  p('Tämä on heikompi signaali kuin lomakelähetys, mutta auttaa ymmärtämään, mitä reittejä käyttäjät kulkevat ennen lopullista toimintaa.'),

  h2('11.2 Sitoutumismittarit eivät ole konversioita'),
  p('GA4 mittaa nämä jo automaattisesti, eikä niitä kannata laskea konversioiksi. Jos kaikesta tehdään konversio, mikään ei enää erotu konversioksi:'),
  bullet('Sivulla vietetty aika'),
  bullet('Vierityssyvyys (esimerkiksi 75 % sivusta luettu)'),
  bullet('Useita sivuja samassa vierailussa'),
  blank(),
  p('Näiden avulla ymmärretään sisällön kiinnostavuutta, mutta varsinainen konversio on aina jokin selkeä ja mitattava toiminto.'),

  h2('11.3 Konversioiden taloudellinen arvo (€)'),
  p('Vaikka kolmekampusta.fi-sivustolla ei ole suoraa myyntiä, jokaiselle konversiolle kannattaa antaa arvio sen taloudellisesta arvosta. Arvio ei tarvitse olla tarkka - se mahdollistaa eri liikennelähteiden (orgaaninen haku, maksettu mainonta, sosiaalinen media tai suora liikenne) vertailun keskenään.'),
  p('Esimerkkejä konversioarvoista (säädetään myöhemmin oman datan perusteella):'),
  bulletBold('Klikki koulutushakemukseen: noin 200 €. ', 'Koulutusmaksu on iso, pieni osuus klikkaajista hakee ja vielä pienempi osa hyväksytään. Korkea arvo per klikki.'),
  bulletBold('Tarjouspyyntö (yritysasiakas): noin 150 €. ', 'Keskimääräinen tilaisuusvaraus on usein huomattava.'),
  bulletBold('Klikki Willba-varaukseen: noin 80 €. ', 'Keskimääräinen yön hinta kerrottuna keskimääräisellä konversiotodennäköisyydellä.'),
  bulletBold('Yhteydenottolomakkeen lähetys: noin 50 €. ', 'Liidin keskimääräinen arvo.'),
  bulletBold('Puhelinklikki mobiilissa: noin 30 €. ', 'Osa soittaa, osa ei.'),
  bulletBold('Esitteen lataus: noin 10 €. ', 'Pieni arvo, alkuvaiheen kiinnostus.'),
  bulletBold('Uutiskirjeen tilaus: noin 5 €. ', 'Pidempi suhteen rakentaminen.'),
  blank(),
  p('Tärkeintä on antaa arvoille suhteellinen järjestys, joka heijastaa todellista taloudellista merkitystä. Tarkat luvut säädetään, kun ymmärrys konversiopolusta paranee ensimmäisten kuukausien aikana.'),

  h2('11.4 Suositus: aloita pienestä'),
  p('Älä yritä rakentaa kaikkea kerralla. Aloita 3-5 keskeisestä konversiosta:'),
  numbered('Yhteydenottolomakkeen lähetys'),
  numbered('Klikki Willba-varaukseen'),
  numbered('Klikki koulutushakemukseen'),
  numbered('Puhelinklikki (mobiili)'),
  numbered('Tärkeimpien lomakkeiden lähetys (esimerkiksi tarjouspyyntö)'),
  blank(),
  p('Näistä syntyy jo selkeä kuva siitä, mitkä sivut tuottavat tulosta. Kun perustoiminta toimii moitteettomasti, voidaan laajentaa tiedostolatauksiin ja muihin pienempiin konversioihin.'),

  h2('11.5 Tekninen toteutus'),
  p('Hyvä uutinen: GTM-säiliö on jo käytössä schema-toteutuksen myötä, joten konversioseurannan lisääminen tapahtuu samalla työkalulla. Tarvittavat osat:'),
  bullet('GTM-liipaisimet (Form Submission, Link Click) määritellään GTM:ssä eivätkä vaadi Drupal-muutoksia.'),
  bullet('Google Analytics 4 (GA4) - tarvitaan, jos ei ole vielä käytössä.'),
  bullet('GA4:ssa "Key events" -merkintä tärkeimmille tapahtumille (Google nimitti konversiot "key events" -tapahtumiksi maaliskuussa 2024).'),
  bullet('Liidit voidaan tarvittaessa viedä myös CRM-järjestelmään (HubSpot, Pipedrive tai vastaava), mutta tämä on toissijaista ja tehdään vasta kun perustoiminta on kunnossa.'),
  blank(),
  p('Tekninen alkukonfigurointi vie arviolta 8-16 tuntia. Sen jälkeen ylläpitoon menee noin tunti kuukaudessa raporttien tarkasteluun ja konversioarvojen säätämiseen oman datan perusteella.'),

  h2('11.6 Mitä konversioseurannalla saavutetaan?'),
  p('Konversioseuranta avaa kolme keskeistä asiaa, jotka muuten jäävät pimentoon.'),

  h3('Mistä lähteistä tuottavimmat kävijät tulevat?'),
  p('Voidaan vertailla: tuottavatko Google-haut, sosiaalisen median linkit, sähköpostimarkkinointi vai suora liikenne enemmän konversioita per kävijä. Tämä ohjaa markkinointipanostuksia oikeille kanaville.'),

  h3('Mitkä sisältösivut tuottavat tulosta?'),
  p('Jokin blogiartikkeli voi tuoda paljon liikennettä mutta vain vähän konversioita - kun taas pienempi opassivu tuo vähemmän kävijöitä mutta paljon enemmän konversioita per kävijä. Tämä auttaa kohdentamaan sisällöntuotannon resurssit oikein.'),

  h3('Toimiiko hakukoneoptimointi ja muu markkinointityö?'),
  p('Ilman konversioseurantaa voidaan vain seurata kävijämääriä. Niiden kasvu ei välttämättä tarkoita, että lisää asiakkaita syntyy. Konversioseuranta kertoo, syntyykö liikenteen kasvusta myös todellista liiketoiminta-arvoa.'),
  blank(),
  p('Ilman tätä tietoa kaikki SEO-työ tapahtuu osittain sokkona. Konversioseuranta on yksi tärkeimmistä yksittäisistä tehtävistä, joka kannattaa toteuttaa luvun 3 perustyön valmistumisen jälkeen tai sen rinnalla.')
];

// ============================================================
// DOCUMENT
// ============================================================

const doc = new Document({
  creator: 'Kolmen kampuksen urheiluopisto',
  title: 'Hakukonenäkyvyyden jatkotehtävät - kolmekampusta.fi',
  description: 'SEO-kehityssuunnitelma schema-toteutuksen jälkeen',

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
      ...section10,
      ...section11
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('seo-jatkotehtavat-suomeksi.docx', buffer);
  console.log('OK: seo-jatkotehtavat-suomeksi.docx created');
}).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
