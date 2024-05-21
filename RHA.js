// Importér data fra data.js
import { data } from './data.js';

document.addEventListener("DOMContentLoaded", function () {
  const hospitalSelect = document.getElementById("hospitalSelect");
  const uniqueHospitals = {};

  // Gennemgå data.indkøb for at tilføje alle hospitaler
  data.indkøb.forEach((item) => {
    uniqueHospitals[item.Hospital] = true;
  });

  // Gennemgå data.forbrug for at tilføje alle hospitaler
  data.forbrug.forEach((item) => {
    uniqueHospitals[item.Hospital] = true;
  });

  // Gennemgå data.kassation for at tilføje alle hospitaler
  data.kassation.forEach((item) => {
    uniqueHospitals[item.Hospital] = true;
  });

  // Gennemgå data.lagerbeholdning for at tilføje alle hospitaler
  data.lagerbeholdning.forEach((item) => {
    uniqueHospitals[item.Hospital] = true;
  });

  // Tilføj hvert unikt hospital til dropdown-menuen
  Object.keys(uniqueHospitals).forEach((hospital) => {
    const option = document.createElement("option");
    option.value = hospital;
    option.textContent = hospital;
    hospitalSelect.appendChild(option);
  });

  updateAfdelinger(); // Opdater afdelinger og afsnit når siden indlæses
});

function updateAfdelinger() {
  const hospitalSelect = document.getElementById("hospitalSelect");
  const afdelingSelect = document.getElementById("afdelingSelect");
  const selectedHospitalName = hospitalSelect.value;

  // Find det valgte hospital i den nye struktur
  const selectedHospital = data.hospitaler.find(
    (hospital) => hospital.Navn === selectedHospitalName
  );

  afdelingSelect.innerHTML = ""; // Ryd tidligere afdelinger
  selectedHospital.Afdelinger.forEach((afdeling) => {
    const option = document.createElement("option");
    option.value = afdeling.Navn;
    option.textContent = afdeling.Navn;
    afdelingSelect.appendChild(option);
  });

  updateAfsnit(); // Opdater afsnit baseret på den første afdeling som standard
}

function updateAfsnit() {
  const hospitalSelect = document.getElementById("hospitalSelect");
  const afdelingSelect = document.getElementById("afdelingSelect");
  const afsnitSelect = document.getElementById("afsnitSelect");
  const selectedHospitalName = hospitalSelect.value;
  const selectedAfdelingName = afdelingSelect.value;

  // Find det valgte hospital og afdeling
  const selectedHospital = data.hospitaler.find(
    (hospital) => hospital.Navn === selectedHospitalName
  );
  const selectedAfdeling = selectedHospital.Afdelinger.find(
    (afdeling) => afdeling.Navn === selectedAfdelingName
  );

  afsnitSelect.innerHTML = ""; // Ryd tidligere afsnit
  selectedAfdeling.Afsnit.forEach((afsnit) => {
    const option = document.createElement("option");
    option.value = afsnit;
    option.textContent = afsnit;
    afsnitSelect.appendChild(option);
  });

  displayData(); // Opdater data visning baseret på valgte valg
}

function displayData() {
  const sectionSelect = document.getElementById("afsnitSelect");
  if (!sectionSelect) {
    console.error("AfsnitSelect elementet blev ikke fundet");
    return;
  }
  const selectedSection = sectionSelect.value;

  const hospitalSelect = document.getElementById("hospitalSelect");
  const departmentSelect = document.getElementById("afdelingSelect");

  if (!hospitalSelect || !departmentSelect) {
    console.error(
      "HospitalSelect eller DepartmentSelect elementet blev ikke fundet"
    );
    return;
  }

  const selectedHospital = hospitalSelect.value;
  const selectedDepartment = departmentSelect.value;

  const results = calculateWaste(data);
  const locationKey = `${selectedHospital} - ${selectedDepartment} - ${selectedSection}`;
  const locationData = results[locationKey];
  const reportDiv = document.getElementById("report");

  if (!reportDiv) {
    console.error("ReportDiv elementet blev ikke fundet");
    return;
  }

  reportDiv.innerHTML = "";
  if (locationData) {
    Object.keys(locationData).forEach((medicin) => {
      const info = locationData[medicin];
      const content = `Medicin: ${medicin}, Indkøbt: ${
        info.indkøb
      }, Forbrugt: ${info.forbrug}, Kasseret: ${info.kassation}, Lager: ${
        info.lager
      }, Spild: ${info.spild}, Spildomkostninger: ${info.spildBeløb.toFixed(
        2
      )} kr.`;
      const p = document.createElement("p");
      p.textContent = content;
      p.className = "medication-info";
      reportDiv.appendChild(p);
    });
  } else {
    reportDiv.textContent = "Ingen data tilgængelig for valgt kombination.";
  }
}

function calculateWaste(data) {
  const results = {};
  // Initialisér og beregn totaler for indkøb, forbrug, kassation og lager
  ["indkøb", "forbrug", "kassation", "lagerbeholdning"].forEach((category) => {
    data[category].forEach((item) => {
      const { Medicin, Antal, Hospital, Afdeling, Afsnit, Beløb } = item;
      const key = `${Hospital} - ${Afdeling} - ${Afsnit}`;
      if (!results[key]) results[key] = {};
      if (!results[key][Medicin]) {
        results[key][Medicin] = {
          indkøb: 0,
          forbrug: 0,
          kassation: 0,
          lager: 0,
          spild: 0,
          spildBeløb: 0,
          prisPerEnhed: 0,
        };
      }
      results[key][Medicin][category.replace("beholdning", "")] += Antal;

      // Opdater pris per enhed hvis det er et 'indkøb'
      if (category === "indkøb") {
        results[key][Medicin].prisPerEnhed = Beløb;
      }
    });
  });

  // Beregn spild og spildomkostninger
  for (let location in results) {
    for (let medicin in results[location]) {
      const meds = results[location][medicin];
      meds.spild = meds.indkøb - meds.forbrug - meds.kassation - meds.lager;
      // Juster spildet til 0 hvis det er negativt
      if (meds.spild < 0) {
        meds.spild = 0;
      }
      // Beregn omkostningerne ved spild
      meds.spildBeløb = meds.spild * meds.prisPerEnhed;
      console.log(
        `Beregnet for ${medicin}: Spild = ${meds.spild}, Pris per enhed = ${meds.prisPerEnhed}, SpildBeløb = ${meds.spildBeløb}`
      );
    }
  }

  return results;
}
