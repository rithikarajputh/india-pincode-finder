let pincodeData = [];

function parseCSVLine(line) {
    let result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        let char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ""));
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
}

async function loadPincodeData() {
    if (pincodeData.length > 0) {
        return;
    }

    let response = await fetch("india-pincode.csv");
    let csvText = await response.text();

    let lines = csvText.trim().split(/\r?\n/);

    let headers = parseCSVLine(lines[0]).map(function (header) {
        return header.trim().toLowerCase();
    });

    for (let i = 1; i < lines.length; i++) {
        let values = parseCSVLine(lines[i]);

        let row = {};

        headers.forEach(function (header, index) {
            row[header] = values[index] ? values[index].trim() : "";
        });

        pincodeData.push(row);
    }
}

async function searchPincode() {
    let pincode = document.getElementById("pin").value.trim();

    if (pincode.length !== 6) {
        alert("Please enter a valid 6 digit pincode");
        return;
    }

    document.getElementById("result").innerHTML =
        "<h3>Loading local database...</h3>";

    try {
        await loadPincodeData();

        let results = pincodeData.filter(function (item) {
            return item.pincode === pincode;
        });

        if (results.length === 0) {
            document.getElementById("result").innerHTML =
                "<h3>❌ Pincode Not Found</h3>";
            return;
        }

        let html = `
            <h3>📍 Location Details</h3>
            <p><b>Pincode:</b> ${pincode}</p>
            <p><b>District:</b> ${results[0].district}</p>
            <p><b>State:</b> ${results[0].statename}</p>
            <hr>
            <h4>Post Offices</h4>
        `;

        results.forEach(function (office) {
            html += `
                <div class="office-card">
                    <p><b>Office:</b> ${office.officename}</p>
                    <p><b>Office Type:</b> ${office.officetype}</p>
                    <p><b>Delivery:</b> ${office.delivery}</p>
                    <p><b>Division:</b> ${office.divisionname}</p>
                </div>
            `;
        });

        document.getElementById("result").innerHTML = html;

    } catch (error) {
        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Loading CSV Data</h3>";

        console.log(error);
    }
}

async function searchArea() {
    let area = document.getElementById("area").value.trim().toLowerCase();

    if (area === "") {
        alert("Please enter area name");
        return;
    }

    document.getElementById("result").innerHTML =
        "<h3>Loading local database...</h3>";

    try {
        await loadPincodeData();

        let results = pincodeData.filter(function (item) {
            return item.officename &&
                   item.officename.toLowerCase().includes(area);
        });

        if (results.length === 0) {
            document.getElementById("result").innerHTML =
                "<h3>❌ Area Not Found</h3>";
            return;
        }

        results = results.slice(0, 50);

        let html = "<h3>📍 Matching Results</h3>";

        results.forEach(function (office) {
            html += `
                <div class="office-card">
                    <p><b>Office:</b> ${office.officename}</p>
                    <p><b>Pincode:</b> ${office.pincode}</p>
                    <p><b>District:</b> ${office.district}</p>
                    <p><b>State:</b> ${office.statename}</p>
                    <p><b>Delivery:</b> ${office.delivery}</p>
                </div>
            `;
        });

        document.getElementById("result").innerHTML = html;

    } catch (error) {
        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Loading CSV Data</h3>";

        console.log(error);
    }
}