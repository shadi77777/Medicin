const data = {
  indkøb: [
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat A",
      Antal: 200,
      Beløb: 5000,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat B",
      Antal: 500,
      Beløb: 40000,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet2",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
  ],
  forbrug: [
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat A",
      Antal: 100,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat B",
      Antal: 250,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet2",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
  ],
  kassation: [
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat A",
      Antal: 50,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat B",
      Antal: 100,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet2",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 2",
    },
  ],
  lagerbeholdning: [
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat A",
      Antal: 30,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
    {
      DatoPrintet: "2024-05-03",
      Medicin: "Præparat B",
      Antal: 40,
      Tidsperiode: "2024-05",
      Hospital: "Rigshospitalet2",
      Afdeling: "Medicinsk Afdeling",
      Afsnit: "Afsnit 1",
    },
  ],
  hospitaler: [
    {
      Navn: "Rigshospitalet",
      Afdelinger: [
        {
          Navn: "Medicinsk Afdeling",
          Afsnit: ["Afsnit 1", "Afsnit 2"],
        },
      ],
    },
    {
      Navn: "Rigshospitalet2",
      Afdelinger: [
        {
          Navn: "Medicinsk Afdeling",
          Afsnit: ["Afsnit 1", "Afsnit 2"],
        },
      ],
    },
  ],
};

document.addEventListener("DOMContentLoaded", function () {
  const hospitalSelect = document.getElementById("hospitalSelect");
  const uniqueHospitals = new Set(data.indkøb.map((item) => item.Hospital));

  uniqueHospitals.forEach((hospital) => {
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
      // Beregn omkostningerne ved spild
      meds.spildBeløb = meds.spild * meds.prisPerEnhed;
      console.log(
        `Beregnet for ${medicin}: Spild = ${meds.spild}, Pris per enhed = ${meds.prisPerEnhed}, SpildBeløb = ${meds.spildBeløb}`
      );
    }
  }

  return results;
}
