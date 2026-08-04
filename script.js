let pincodeData = [];
let deferredPrompt;

// Install App Button Logic
window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;

    let installBtn = document.getElementById("installBtn");
    if (installBtn) {
        installBtn.style.display = "block";
    }
});

document.addEventListener("DOMContentLoaded", function () {

    let installBtn = document.getElementById("installBtn");

    if (installBtn) {
        installBtn.addEventListener("click", async function () {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                deferredPrompt = null;
                installBtn.style.display = "none";
            }
        });
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js");
    }
});

// CSV line parser
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

// Load CSV only once
async function loadPincodeData() {

    if (pincodeData.length > 0) {
        return;
    }

    let response = await fetch("india-pincode.csv");

    if (!response.ok) {
        throw new Error("CSV file not found");
    }

    let csvText = await response.text();

    let lines = csvText.trim().split(/\r?\n/);

    let headers = parseCSVLine(lines[0]).map(function (header) {
        return header.trim().toLowerCase().replace(/\ufeff/g, "");
    });

    let pincodeIndex = headers.indexOf("pincode");
    let officeIndex = headers.indexOf("officename");
    let officeTypeIndex = headers.indexOf("officetype");
    let deliveryIndex = headers.indexOf("delivery");
    let districtIndex = headers.indexOf("district");
    let stateIndex = headers.indexOf("statename");
    let divisionIndex = headers.indexOf("divisionname");
    let regionIndex = headers.indexOf("regionname");
    let latitudeIndex = headers.indexOf("latitude");
    let longitudeIndex = headers.indexOf("longitude");

    for (let i = 1; i < lines.length; i++) {

        if (!lines[i].trim()) {
            continue;
        }

        let values = parseCSVLine(lines[i]);

        let pincode = values[pincodeIndex]
            ? values[pincodeIndex].trim().replace(/\D/g, "")
            : "";

        if (!pincode) {
            continue;
        }

        pincodeData.push({
            pincode: pincode,
            officename: values[officeIndex] || "",
            officetype: values[officeTypeIndex] || "",
            delivery: values[deliveryIndex] || "",
            district: values[districtIndex] || "",
            statename: values[stateIndex] || "",
            divisionname: values[divisionIndex] || "",
            regionname: values[regionIndex] || "",
            latitude: values[latitudeIndex] || "",
            longitude: values[longitudeIndex] || ""
        });
    }
}

// Search by pincode
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

            <h4>Post Offices Found: ${results.length}</h4>
        `;

        results.forEach(function (office) {

            let mapQuery =
                `${office.officename} ${office.district} ${office.statename}`;

            html += `
                <div class="office-card">
                    <p><b>Office:</b> ${office.officename}</p>
                    <p><b>Office Type:</b> ${office.officetype}</p>
                    <p><b>Delivery:</b> ${office.delivery}</p>
                    <p><b>Division:</b> ${office.divisionname}</p>
                    <p><b>Region:</b> ${office.regionname}</p>

                    <button onclick="openMap('${mapQuery}')">
                        🗺 Open In Maps
                    </button>
                </div>
            `;
        });

        document.getElementById("result").innerHTML = html;

    } catch (error) {

        console.log(error);

        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Loading CSV Data</h3>";
    }
}

// Search by area / post office
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

        let html = `
            <h3>📍 Matching Results</h3>
            <p>Showing first ${results.length} results</p>
        `;

        results.forEach(function (office) {

            let mapQuery =
                `${office.officename} ${office.district} ${office.statename}`;

            html += `
                <div class="office-card">
                    <p><b>Office:</b> ${office.officename}</p>
                    <p><b>Pincode:</b> ${office.pincode}</p>
                    <p><b>District:</b> ${office.district}</p>
                    <p><b>State:</b> ${office.statename}</p>
                    <p><b>Delivery:</b> ${office.delivery}</p>

                    <button onclick="openMap('${mapQuery}')">
                        🗺 Open In Maps
                    </button>
                </div>
            `;
        });

        document.getElementById("result").innerHTML = html;

    } catch (error) {

        console.log(error);

        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Loading CSV Data</h3>";
    }
}

// Open Google Maps
function openMap(location) {
    window.open(
        "https://www.google.com/maps/search/" + encodeURIComponent(location),
        "_blank"
    );
}

// Enter key support
document.addEventListener("DOMContentLoaded", function () {
    let pinInput = document.getElementById("pin");

    if (pinInput) {
        pinInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                searchPincode();
            }
        });
    }
});