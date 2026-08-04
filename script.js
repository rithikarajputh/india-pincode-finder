async function searchPincode() {

    let pincode = document.getElementById("pin").value;

    if (pincode.length !== 6) {
        alert("Please enter a valid 6 digit pincode");
        return;
    }

    try {

        let response = await fetch("pincodes.json");

        let data = await response.json();

        let result =
            data.find(item =>
                item.pincode === pincode
            );

        if (!result) {

            document.getElementById("result").innerHTML = `
                <h3>❌ Pincode Not Found</h3>
            `;

            return;
        }

        document.getElementById("result").innerHTML = `
            <h3>📍 Location Details</h3>

            <p><b>Pincode:</b> ${result.pincode}</p>

            <p><b>Area:</b> ${result.area}</p>

            <p><b>District:</b> ${result.district}</p>

            <p><b>State:</b> ${result.state}</p>
        `;

    } catch (error) {

        document.getElementById("result").innerHTML = `
            <h3>⚠️ Error Loading Local Data</h3>
        `;
    }
}