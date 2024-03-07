
console.log("User scripts loaded");

//Events used to re-trigger fetching new data. 
const insertHouseEvent = new Event("insertHouse");
const insertTaskEvent = new Event("insertTask");
const insertContractorEvent = new Event("insertContractor");

async function createHouse(target){

    const body = {
        address : target.address.value || null,
        description : target.description.value || null,
        name : target.name.value || null
        
    };

    console.log(body);

    const res = await fetch("/house", {
        method:"POST",
        body: JSON.stringify(body),
        headers:{
            "Content-Type" : "application/json"
    
        }
    });

    const json = await res.json();
    if(res.ok) {
        console.log("Inserted id: ",json.content);
        window.dispatchEvent(insertHouseEvent);
    }

    else console.error(json);
    

}


//returns data for the x-data tag of "root" element
function view(){
    return {
        tab: "#houses",
        houses:[],
        tasks:[],
        contractors:[],
        
        //fetch functions
        async fetchHouses(){
            try {
                this.houses = (await (await fetch("/house")).json()).content 
            } catch (err) {
                console.error("NO HOUSES");
                this.houses=[];
            }
        },
        async fetchTasks(){

            try {
                this.tasks = (await (await fetch("/task")).json()).content
            } catch (err) {
                console.error("no tasks");
                this.tasks = [];
            }
        },
        async fetchContractors(){
            try {
                this.contractors = (await (await fetch("/contractor")).json()).content
                
            } catch (err) {
                
            }
        }

    }
}