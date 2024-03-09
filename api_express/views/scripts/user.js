
console.log("User scripts loaded");

//Events used to re-trigger fetching new data. 
const insertHouseEvent = new Event("insertHouse");
const insertTaskEvent = new Event("insertTask");
const insertContractorEvent = new Event("insertContractor");

// const showHouseEvent=new Event("showHouse");

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
        console.log("Inserted house with id: ",json.content);

        //This tells Alpine.JS to re-fetch the data.
        window.dispatchEvent(insertHouseEvent);

        //clears form
        target.reset()
    }

    else console.error(json);
    

}

async function createTask(target){
    const body = {
        houseID : target.houseID.value || null,
        description : target.description.value || null,
        
    };
    const res = await fetch("/task", {
        method:"POST",
        body:JSON.stringify(body),
        headers:{
            "Content-Type" : "application/json"
        }
    });

    const json = await res.json();
    if(res.ok) {
        console.log("inserted task with id: ", json.content);

        //this tells alpine to re-fetch tasks, allowing our new task to be displayed.
        window.dispatchEvent(insertTaskEvent);

        target.reset();
    }

    else console.error(json);

}

async function createContractor(target){
    const body = {
        email: target.email.value ||null,
        name: target.name.value ||null,
        phone: target.phone.value ||null,
        occupation: target.occupation.value ||null,
    };

    const res = await fetch("/contractor",{
        method:"POST",
        body:JSON.stringify(body),
        headers:{
            "Content-Type" : "application/json"
        }
    });

    const json = await res.json();

    if(res.ok){
        console.log(json);
        window.dispatchEvent(insertContractorEvent);
    }
    else {
        console.error(json);
    }
}

//returns data for the x-data tag of "root" element
function view(){
    return {
        tab: "#houses",
        houses:[],
        tasks:[],
        contractors:[],
        // house: "",
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
                this.tasks = (await (await fetch("/task")).json()).content;
                // uses GET /task/appointee/:taskID to retreive all contractors for a task. 
                // this makes it possible showing contractors appointed to a task.
                const task_contractors = await Promise.all(this.tasks.map(async(t)=>{
                    return (await(await fetch(`/task/appointee/${t.taskID}`)).json()).content;
                }));
                this.tasks.forEach((t, index) => t.contractors = task_contractors[index]);

                console.log(console.log(task_contractors));
                
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