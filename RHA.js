function loadAndCompareData() {
    fetch("medicinData.json")
        .then(response => response.json())
        .then(data => {
            displayData(data);
            document.getElementById('difference').innerHTML = compareMedicines(data)
        })
        .catch(error => {
            console.error('Fejl ved indlæsning af data:', error);
            document.getElementById('result').textContent = 'Fejl ved indlæsning af data';
        });
}

function displayData(data) {
    const product1Data = `
        <h2>${data[0].navn}</h2>
        <p>Mængde Købt: ${data[0].købt}</p>
        <p>Mængde Anvendt: ${data[0].anvendt}</p>
        <p>Mængde Smidt Ud: ${data[0].smidt_ud}</p>
    `;
    const product2Data = `
        <h2>${data[1].navn}</h2>
        <p>Mængde Købt: ${data[1].købt}</p>
        <p>Mængde Anvendt: ${data[1].anvendt}</p>
        <p>Mængde Smidt Ud: ${data[1].smidt_ud}</p>
    `;
    document.getElementById('product1').innerHTML = product1Data;
    document.getElementById('product2').innerHTML = product2Data;
}

function compareMedicines(data) {
    let result = "<h3>Forskelle</h3>";
    result += calculateDifference(data[0].købt, data[1].købt, "købt");
    result += calculateDifference(data[0].anvendt, data[1].anvendt, "anvendt");
    result += calculateDifference(data[0].smidt_ud, data[1].smidt_ud, "smidt ud");
    return result;
}



function calculateDifference(value1, value2, label) {
    console.log("Values received:", value1, value2);  // Debug output for at bekræfte input
    const diff = value2 - value1;
    const percentDiff = (value1 !== 0) ? (diff / value1 * 100).toFixed(2) : "uendelig";
    console.log("Difference calculated:", diff, "Percent difference:", percentDiff); // Yderligere debug output
    return `<p>Forskel i mængde ${label}: ${diff} (${percentDiff}%)</p>`;
}

