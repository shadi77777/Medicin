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
    const labels = [];
    const datasets = [];

    rapport1.forEach((item1) => {
        const item2 = rapport2.find(item => item.medicinType === item1.medicinType);
        if (item2) {
            labels.push(item1.medicinType);
            const data = {
                købt: item2.købt - item1.købt,
                anvendt: item2.anvendt - item1.anvendt,
                "smidt ud": item2.smidt_ud - item1.smidt_ud,
                penge_brugt: item2.penge_brugt - item1.penge_brugt
            };
            datasets.push(data);
        }
    });

    const ctx = document.getElementById('difference-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forskel i købt',
                data: datasets.map(data => data.købt),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'Forskel i anvendt',
                data: datasets.map(data => data.anvendt),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Forskel i smidt ud',
                data: datasets.map(data => data['smidt ud']),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }, {
                label: 'Forskel i penge_brugt',
                data: datasets.map(data => data.penge_brugt),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 4, // Juster lodret offset for datalabels (standardværdi er 0)
                    formatter: function(value, context) {
                        return value;
                    }
                }
            }
        }
    });
}
