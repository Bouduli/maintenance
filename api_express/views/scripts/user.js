
console.log("User scripts loaded");

//Events used to re-trigger fetching new data. 
const insertHouseEvent = new Event("insertHouse");
const insertTaskEvent = new Event("insertTask");
const insertContractorEvent = new Event("insertContractor");
const dataChangeEvent = new Event("dataChange");

async function alterHouse(target, editing=false){

   try {
     const houseID = target.houseID.value;
     if(editing & !houseID) return alert("houseID not provided in edit.");
 
     const body = {
         address : target.address.value || null,
         description : target.description.value || null,
         name : target.name.value || null
         
     };
 
     console.log(body);
 
     const res = await fetch(`/house/${houseID}`, {
         method: editing? "PUT":"POST",
         body: JSON.stringify(body),
         headers:{
             "Content-Type" : "application/json"
     
         }
     });
    console.log(res);
    const json = await res.json();
    if(res.ok) {
        console.log("Inserted house with id: ",json.content);

        //This tells Alpine.JS to re-fetch the data.
        window.dispatchEvent(dataChangeEvent);

        //clears form
        target.reset();
     }
 
     else console.error(json);
   } catch (err) {
    
        console.error(err);

   }
    

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
        window.dispatchEvent(dataChangeEvent);

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
        window.dispatchEvent(dataChangeEvent);
        target.reset();
    }
    else {
        console.error(json);
    }
}

// async function inviteContractor(target){
async function inviteContractor(email, taskID){
    try {
        const body = {
            // taskID : target.taskID.value || null,
            // email : target.email.value || null,
            email: email,
            taskID: taskID
        }

        console.log(body);
        const res = await fetch("/task/invite", {
            method:"POST",
            body: JSON.stringify(body),
            headers:{
                "Content-Type": "application/json"
            }
            
        });
        const json = await res.json();
        if(res.ok){
            console.log(json);

            //note this triggers re-fetch of all tasks, however this acheives the correct action
            // with minimum effort :)
            window.dispatchEvent(dataChangeEvent);

        }

    } catch (err) {
        console.error(err);
    }
}
async function destroy(type , id, target){

    // console.log("destroyType: ", type );
    // console.log("destroyId: ", id );
    // console.log("target", target);

    const url = `/${type}/${id}`;
    console.log("destroy url : ", url);

    
    const res = await fetch(url, {
        method:"DELETE"
    })

    const json = await res.json();

    if(res.ok){
        console.log(json);
        window.dispatchEvent(dataChangeEvent);
    }
    else {
        console.error(json);

    }

}

async function handleSuggestion(id, handle_method){
    try {
        const res = await fetch(`/task/suggestion/${id}`, {
            method: handle_method
        });
        const json = await res.json();

        if(res.ok){
            console.log(json);
            window.dispatchEvent(dataChangeEvent);
        }
    } catch (err) {
        console.error(json);
    }
}

//returns data for the x-data tag of "root" element
function view(){
    return {
        tab: "#houses",
        subtab:'houseWrapper',
        modal:false,
        house:{ tasks:[]},
        houses:[],
        tasks:[],
        contractors:[],
        suggestions:[],
        async data(){
            await this.fetchHouses();
            await this.fetchTasks();
            await this.fetchContractors();
            await this.fetchSuggestions();
            //make house-modal update itself.
            if(this.house.houseID) this.house.tasks = this.tasks.filter(t=>t.houseID == this.house.houseID);
        },
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
                    try {
                        return (await(await fetch(`/task/appointee/${t.taskID}`)).json()).content || [];
                    } catch {
                        return [];
                    }
                }));
                console.log("task_contractors: ", task_contractors);
                this.tasks.forEach((t, index) => t.contractors = task_contractors[index]);

                // console.log(console.log(task_contractors));
                
            } catch (err) {
                console.error("no tasks");
                this.tasks = [];
            }
        },
        async fetchContractors(){
            try {
                this.contractors = (await (await fetch("/contractor")).json()).content
                
            } catch (err) {
                console.log("no contractors");
                this.contractors=[];
            }
        },
        async fetchSuggestions(){
            try {
                this.suggestions = (await(await fetch("/task/suggestion")).json()).content;
                // console.log(this.suggestions);
            } catch (err) {
                console.log("no suggestions");
                this.suggestions=[];
            }
        },
        /**
         * Retreives the house from houses-array, with tasks mapped to it.
         * @param {string} house houseID
         */
        getHouse(house){
            const h = this.houses.find(h=>h.houseID == house);
            //if no house was found with the id, then "empty house" is returned
            if(!h) return {tasks:[]};

            h.tasks = this.tasks.filter(t=>t.houseID == house);
            return h;
        }

    }
}