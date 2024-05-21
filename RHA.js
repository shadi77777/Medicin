import { data } from './data.js';

class HospitalDataManager {
    constructor(data) {
        this.data = data;
        this.initialize();
    }

    initialize() {
        document.addEventListener("DOMContentLoaded", () => {
            this.populateHospitals();
            this.addEventListeners();
        });
    }

    populateHospitals() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const uniqueHospitals = {};

        ['indkøb', 'forbrug', 'kassation', 'lagerbeholdning'].forEach(category => {
            this.data[category].forEach(item => {
                uniqueHospitals[item.Hospital] = true;
            });
        });

        Object.keys(uniqueHospitals).forEach(hospital => {
            const option = document.createElement("option");
            option.value = hospital;
            option.textContent = hospital;
            hospitalSelect.appendChild(option);
        });

        this.updateAfdelinger();  // Initially populate departments
    }

    addEventListeners() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const afsnitSelect = document.getElementById("afsnitSelect");

        hospitalSelect.addEventListener('change', () => this.updateAfdelinger());
        afdelingSelect.addEventListener('change', () => this.updateAfsnit());
        afsnitSelect.addEventListener('change', () => this.displayData());
    }

    updateAfdelinger() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const selectedHospital = this.data.hospitaler.find(hospital => hospital.Navn === hospitalSelect.value);

        afdelingSelect.innerHTML = "";
        selectedHospital.Afdelinger.forEach(afdeling => {
            const option = document.createElement("option");
            option.value = afdeling.Navn;
            option.textContent = afdeling.Navn;
            afdelingSelect.appendChild(option);
        });

        this.updateAfsnit(); // Initially populate sections
    }

    updateAfsnit() {
        const hospitalSelect = document.getElementById("hospitalSelect");
        const afdelingSelect = document.getElementById("afdelingSelect");
        const afsnitSelect = document.getElementById("afsnitSelect");
        const selectedHospital = this.data.hospitaler.find(hospital => hospital.Navn === hospitalSelect.value);
        const selectedAfdeling = selectedHospital.Afdelinger.find(afdeling => afdeling.Navn === afdelingSelect.value);

        afsnitSelect.innerHTML = "";
        selectedAfdeling.Afsnit.forEach(afsnit => {
            const option = document.createElement("option");
            option.value = afsnit;
            option.textContent = afsnit;
            afsnitSelect.appendChild(option);
        });

        this.displayData(); // Initially display data
    }

    displayData() {
        const afsnitSelect = document.getElementById("afsnitSelect");
        const reportDiv = document.getElementById("report");
        const selectedSection = afsnitSelect.value;
        const results = this.calculateWaste();
        const locationKey = `${selectedSection}`;

        reportDiv.innerHTML = "";
        const locationData = results[locationKey] || {};
        Object.keys(locationData).forEach(medicin => {
            const info = locationData[medicin];
            const content = `Medicin: ${medicin}, Indkøbt: ${info.indkøb}, Forbrugt: ${info.forbrug}, Kasseret: ${info.kassation}, Lager: ${info.lager}, Svind: ${info.spild}, Svindomkostninger: ${info.spildBeløb.toFixed(2)} kr.`;
            const p = document.createElement("p");
            p.textContent = content;
            p.className = "medication-info";
            reportDiv.appendChild(p);
        });
    }

    calculateWaste() {
        const results = {};
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
                if (category === 'indkøb') {
                    results[key][item.Medicin].prisPerEnhed = item.Beløb / item.Antal;
                }
            });
        });

        for (let location in results) {
            for (let medicin in results[location]) {
                const meds = results[location][medicin];
                meds.spild = meds.indkøb - meds.forbrug - meds.kassation - meds.lager;
                if (meds.spild < 0) meds.spild = 0;
                meds.spildBeløb = meds.spild * meds.prisPerEnhed;
            }
        }
        return results;
    }
}

// Initialize the class with data
new HospitalDataManager(data);
