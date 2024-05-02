function loadAndCompareData() {
    fetch("medicinData.json")
        .then(response => response.json())
        .then(data => {
            displayReport(data.rapport1, 'report1');
            displayReport(data.rapport2, 'report2');
            compareReports(data.rapport1, data.rapport2);
        })
        .catch(error => {
            console.error('Fejl ved indlæsning af data:', error);
            document.getElementById('difference').textContent = 'Fejl ved indlæsning af data';
        });
}

function displayReport(reportData, elementId) {
    const container = document.getElementById(elementId);
    let content = `<h2>Rapport ${elementId}</h2>`;
    reportData.forEach(item => {
        content += `<div>
            <h3>${item.medicinType}</h3>
            <p>Mængde Købt: ${item.købt}</p>
            <p>Mængde Anvendt: ${item.anvendt}</p>
            <p>Mængde Smidt Ud: ${item.smidt_ud}</p>
            <p>Penge Brugt: ${item.penge_brugt} kr</p>
        </div>`;
    });
    container.innerHTML = content;
}

function compareReports(rapport1, rapport2) {
    let result = "<h3>Sammenligning af Rapporter</h3>";
    rapport1.forEach((item1) => {
        const item2 = rapport2.find(item => item.medicinType === item1.medicinType);
        if (item2) {
            result += `<h4>${item1.medicinType}</h4>`;
            result += compareItems(item1, item2, "købt");
            result += compareItems(item1, item2, "anvendt");
            result += compareItems(item1, item2, "smidt_ud"); // Ændres til "smidt_ud" her
            result += compareItems(item1, item2, "penge_brugt");
        }
    });
    document.getElementById('difference').innerHTML = result;
}

function compareItems(item1, item2, field) {
    const value1 = item1[field];
    const value2 = item2[field];
    const diff = value2 - value1;
    const percentDiff = (value1 !== 0) ? (diff / value1 * 100).toFixed(2) : "uendelig";
    return `<p>Forskel i ${field}: ${diff} (${percentDiff}%)</p>`;
}

