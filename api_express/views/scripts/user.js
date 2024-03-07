
console.log("User scripts loaded");

async function createHouse(target){

    const body = {
        address : target.address.value || null,
        description : target.description.value || null,
        name : target.name.value || null
        
    };

    console.log(body);

    const res = await fetch("/house", {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    });

    const json = await res.json();
    if(res.ok) {
        console.log("Inserted id: ",json.content)
    }

    else console.error(json);
    

}