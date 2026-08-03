async function searchPincode() {

    let pincode = document.getElementById("pin").value;

    if (pincode.length !== 6) {
        alert("Please enter a valid 6 digit pincode");
        return;
    }

    saveSearch(pincode);

    document.getElementById("result").innerHTML =
        "<h3>⏳ Searching...</h3>";

    try {

        let response =
            await fetch(
                `https://api.postalpincode.in/pincode/${pincode}`
            );

        let data = await response.json();

        let postOffice = data[0].PostOffice;

        if (!postOffice) {

            document.getElementById("result").innerHTML =
                "<h3>❌ No Data Found</h3>";

            return;
        }

        let district = postOffice[0].District;
        let state = postOffice[0].State;
        let country = postOffice[0].Country;

        let fullAddress =
            `${district}, ${state}, ${country}`;

        let html = `
            <h3>📍 Location Details</h3>

            <p><b>District:</b> ${district}</p>
            <p><b>State:</b> ${state}</p>
            <p><b>Country:</b> ${country}</p>

            <button onclick="openMaps('${district} ${state}')">
                🗺 Open In Maps
            </button>

            <button onclick="copyAddress('${fullAddress}')">
                📋 Copy Address
            </button>

            <hr>

            <h4>🏢 Post Offices</h4>
        `;

        postOffice.forEach(function (office) {

            html += `
                <p>📮 ${office.Name}</p>
            `;

        });

        html += createHistoryHtml();

        document.getElementById("result").innerHTML =
            html;

    } catch {

        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Fetching Data</h3>";
    }
}

async function searchArea() {

    let area =
        document.getElementById("area").value;

    if(area.trim() === "")
    {
        alert("Enter Area Name");
        return;
    }

    document.getElementById("result").innerHTML =
        "<h3>⏳ Searching...</h3>";

    try {

        let response =
            await fetch(
                `https://api.postalpincode.in/postoffice/${area}`
            );

        let data = await response.json();

        let postOffice = data[0].PostOffice;

        if (!postOffice) {

            document.getElementById("result").innerHTML =
                "<h3>❌ No Area Found</h3>";

            return;
        }

        let html =
            "<h3>📍 Matching Pincodes</h3>";

        postOffice.forEach(function (office) {

            html += `
                <p>
                    📮 ${office.Name}
                    - ${office.Pincode}
                </p>
            `;

        });

        document.getElementById("result").innerHTML =
            html;

    } catch {

        document.getElementById("result").innerHTML =
            "<h3>⚠️ Error Fetching Data</h3>";
    }
}

function openMaps(location) {

    window.open(
        `https://www.google.com/maps/search/${location}`,
        "_blank"
    );
}

function copyAddress(address) {

    navigator.clipboard.writeText(address);

    alert("✅ Address Copied");
}

function saveSearch(pin) {

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    history.unshift(pin);

    history = [...new Set(history)];

    history = history.slice(0, 5);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );
}

function createHistoryHtml() {

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    let html =
        "<hr><h4>🕒 Recent Searches</h4>";

    history.forEach(function(pin){

        html += `
            <p
                class="history-item"
                onclick="searchFromHistory('${pin}')">
                ${pin}
            </p>
        `;
    });

    return html;
}

function searchFromHistory(pin){

    document.getElementById("pin").value = pin;

    searchPincode();
}

document
.getElementById("pin")
.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        searchPincode();
    }

});