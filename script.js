async function searchPincode() {

    let pincode = document.getElementById("pin").value;

    document.getElementById("result").innerHTML =
        "<h3>Loading...</h3>";

    try {

        let response = await fetch("pincodes.json");

        let data = await response.json();

        let result =
            data.find(
                item => item.pincode === pincode
            );

        if (!result) {

            document.getElementById("result").innerHTML =
                "<h3>Pincode Not Found</h3>";

            return;
        }

        document.getElementById("result").innerHTML = `
            <h3>Location Details</h3>

            <p>Pincode: ${result.pincode}</p>

            <p>Area: ${result.area}</p>

            <p>District: ${result.district}</p>

            <p>State: ${result.state}</p>
        `;

    } catch (error) {

        document.getElementById("result").innerHTML =
            "<h3>Error Loading Local Data</h3>";

        console.log(error);
    }
}