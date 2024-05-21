import { data } from './data.js';

// Definerer en klasse til at håndtere hospitalsdata
class HospitalDataManager {
    constructor(data) {
        this.data = data;  // Gemmer data som en instansvariabel
        this.initialize(); // Initialiserer klassen
    }

    initialize() {
        // Venter på at hele dokumentet er indlæst før noget køres
        document.addEventListener("DOMContentLoaded", () => {
            this.populateHospitals(); // Fylder dropdown-menuen med hospitaler
            this.addEventListeners(); // Tilføjer event listeners til dropdown-menuerne
        });
    }

    populateHospitals() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const uniqueHospitals = {};

        // Går igennem hver kategori og indsamler unikke hospitaler
        ['indkøb', 'forbrug', 'kassation', 'lagerbeholdning'].forEach(category => {
            this.data[category].forEach(item => {
                uniqueHospitals[item.Hospital] = true; // Bruges som et sæt til at få unikke hospitaler
            });
        });

        // Tilføjer hver unikt hospital som en option i hospital dropdown-menuen
        Object.keys(uniqueHospitals).forEach(hospital => {
            const option = document.createElement("option");
            option.value = hospital;
            option.textContent = hospital;
            hospitalSelect.appendChild(option);
        });

        this.updateAfdelinger();  // Opdaterer afdelinger baseret på det første valgte hospital
    }

    addEventListeners() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const afsnitSelect = document.getElementById("afsnitSelect");

        // Tilføjer event listeners som reagerer på ændringer i dropdown-menuerne
        hospitalSelect.addEventListener('change', () => this.updateAfdelinger());
        afdelingSelect.addEventListener('change', () => this.updateAfsnit());
        afsnitSelect.addEventListener('change', () => this.displayData());
    }

    updateAfdelinger() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const selectedHospital = this.data.hospitaler.find(hospital => hospital.Navn === hospitalSelect.value);

        afdelingSelect.innerHTML = ""; // Rydder afdeling dropdown-menuen
        // Fylder afdeling dropdown-menuen baseret på det valgte hospital
        selectedHospital.Afdelinger.forEach(afdeling => {
            const option = document.createElement("option");
            option.value = afdeling.Navn;
            option.textContent = afdeling.Navn;
            afdelingSelect.appendChild(option);
        });

        this.updateAfsnit(); // Opdaterer afsnit baseret på det første valgte afdeling
    }

    updateAfsnit() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const afsnitSelect = document.getElementById("afsnitSelect");
        const selectedHospital = this.data.hospitaler.find(hospital => hospital.Navn === hospitalSelect.value);
        const selectedAfdeling = selectedHospital.Afdelinger.find(afdeling => afdeling.Navn === afdelingSelect.value);

        afsnitSelect.innerHTML = ""; // Rydder afsnit dropdown-menuen
        // Fylder afsnit dropdown-menuen baseret på det valgte hospital og afdeling
        selectedAfdeling.Afsnit.forEach(afsnit => {
            const option = document.createElement("option");
            option.value = afsnit;
            option.textContent = afsnit;
            afsnitSelect.appendChild(option);
        });

        this.displayData(); // Viser data for det første valgte afsnit
    }

    displayData() {
        const afsnitSelect = document.getElementById("afsnitSelect");
        const reportDiv = document.getElementById("report");
        const selectedSection = afsnitSelect.value;
        const results = this.calculateWaste(); // Beregner spild og svindomkostninger
        const locationKey = `${selectedSection}`;

        reportDiv.innerHTML = ""; // Rydder rapportområdet
        const locationData = results[locationKey] || {};
        // Går igennem hver medicin i det valgte afsnit og opretter en tekstbeskrivelse
        Object.keys(locationData).forEach(medicin => {
            const info = locationData[medicin];
            const content = `Medicin: ${medicin}, Indkøbt: ${info.indkøb}, Forbrugt: ${info.forbrug}, Kasseret: ${info.kassation}, Lager: ${info.lager}, Svind: ${info.spild}, Svindomkostninger: ${info.spildBeløb.toFixed(2)} kr.`;
            const p = document.createElement("p");
            p.textContent = content;
            p.className = "medication-info";
            reportDiv.appendChild(p); // Tilføjer tekstbeskrivelsen til rapportområdet
        });
    }

    calculateWaste() {
        const results = {};
        // Gennemgår data i hver kategori for at beregne totaler og priser
        ['indkøb', 'forbrug', 'kassation', 'lagerbeholdning'].forEach(category => {
            this.data[category].forEach(item => {
                const key = `${item.Afsnit}`;
                if (!results[key]) results[key] = {};
                if (!results[key][item.Medicin]) {
                    results[key][item.Medicin] = {
                        indkøb: 0,
                        forbrug: 0,
                        kassation: 0,
                        lager: 0,
                        spild: 0,
                        spildBeløb: 0,
                        prisPerEnhed: 0
                    };
                }
                results[key][item.Medicin][category.replace("beholdning", "")] += item.Antal;
                // Beregner pris per enhed ved indkøb
                if (category === 'indkøb') {
                    results[key][item.Medicin].prisPerEnhed = item.Beløb / item.Antal;
                }
            });
        });

        // Beregner spild og spildomkostninger for hver medicin i hvert afsnit
        for (let location in results) {
            for (let medicin in results[location]) {
                const meds = results[location][medicin];
                meds.spild = meds.indkøb - meds.forbrug - meds.kassation - meds.lager;
                if (meds.spild < 0) meds.spild = 0; // Sikrer, at spild ikke er negativt
                meds.spildBeløb = meds.spild * meds.prisPerEnhed; // Beregner spildomkostninger
            }
        }
        return results; // Returnerer de beregnede resultater
    }
}

// Initialiserer klassen med data
new HospitalDataManager(data);
