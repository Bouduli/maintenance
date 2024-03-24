
console.log("User scripts loaded");

//Event used to re-trigger fetching new data. 
const dataChangeEvent = new Event("dataChange");

async function alterHouse(target, editing = false) {

    try {
        const houseID = target.houseID.value;
        if (editing & !houseID) return alert("houseID not provided in edit.");

        const body = {
            address: target.address.value || null,
            description: target.description.value || null,
            name: target.name.value || null

        };

        console.log(body);

        const res = await fetch(`/house/${houseID}`, {
            method: editing ? "PUT" : "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"

            }
        });
        console.log(res);
        const json = await res.json();
        if (res.ok) {
            console.log("Inserted house with id: ", json.content);

            //This tells Alpine.JS to re-fetch the data.
            window.dispatchEvent(dataChangeEvent);

            //clears form
            target.reset();
            
            return json.content.id;
        }
        else console.error(json);
    } catch (err) {

        console.error(err);

    }


}
async function alterTask(target, editing = false) {
    try {
        const taskID = target.taskID.value;
        if (editing & !taskID) return alert("taskID not provided in edit.");

        const body = {
            description: target.description.value || null,
            houseID: target.houseID.value || null

        };

        const res = await fetch(`/task/${taskID}`, {
            method: editing ? "PUT" : "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"

            }
        });

        const json = await res.json();

        if (res.ok) {
            console.log("altered task with id: ", json.content);
            //This tells Alpine.JS to re-fetch the data.
            window.dispatchEvent(dataChangeEvent);

            //clears form
            target.reset();

            //could maybe be used to set taskDetails to the new task, however I wont focus this now.
            return json.content.id;

        }
        else console.error("res not ok: ", json);


    } catch (err) {
        console.error("unable to alter task: ", err);
    }
}

async function alterContractor(target, editing=false){
    try {
        const contractorID = target.contractorID.value;

        if(editing & !contractorID) return alert("contractorID not provided in edit");

        const body = {
            email: target.email.value || null,
            name: target.name.value || null,
            phone: target.phone.value || null,
            occupation: target.occupation.value || null,
            contractorID: contractorID || null
        };

        const res = await fetch(`/contractor/${contractorID}`,{
            method: editing ? "PUT" :"POST",
            body:JSON.stringify(body),
            headers:{
                "Content-Type": "application/json"
            }
        });
        
        const json = await res.json();

        if(res.ok){
            console.log("altered contractor: ", json);

            window.dispatchEvent(dataChangeEvent);

            //clears-form
            target.reset();

            //can maybe be used to swap view into contractorDetails.
            return json.content.id;
        }
        else console.error(json);

    } catch (err) {
        console.log(err);
    }
}

// async function inviteContractor(target){
async function inviteContractor(contractorID, taskID) {
    try {
        const body = {
            contractorID: contractorID,
            taskID: taskID
        };

        console.log(body);

        const res = await fetch("/task/invite", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }

        });
        const json = await res.json();
        if (res.ok) {
            console.log(json);

            //note this triggers re-fetch of all tasks, however this acheives the correct action
            // with minimum effort :)
            window.dispatchEvent(dataChangeEvent);

        }

    } catch (err) {
        console.error(err);
    }
}
async function destroy(type, id, target) {

    // console.log("destroyType: ", type );
    // console.log("destroyId: ", id );
    // console.log("target", target);

    const url = `/${type}/${id}`;
    console.log("destroy url : ", url);

    const res = await fetch(url, {
        method: "DELETE"
    })

    const json = await res.json();

    if (res.ok) {
        console.log(json);
        window.dispatchEvent(dataChangeEvent);
    }
    else {
        console.error(json);

    }

}

async function handleSuggestion(id, handle_method) {
    try {
        const res = await fetch(`/task/suggestion/${id}`, {
            method: handle_method
        });
        const json = await res.json();

        if (res.ok) {
            console.log(json);
            window.dispatchEvent(dataChangeEvent);
        }
    } catch (err) {
        console.error(json);
    }
}

//returns data for the x-data tag of "root" element
function view() {
    return {
        tab: "#houses",
        subtab: 'houseWrapper',
        modal: false,

        house: { tasks: [] },
        // used to accurately display task_filter when going from houseDetails to Tasks with the "show tasks" button. 
        selected_house_id: "",
        houses: [],

        tasks: [],
        filteredTasks: [],
        task: { contractors: [] },

        contractors: [],
        contractor: { suggestions:[] },

        suggestions: [],
        async data() {
            await this.fetchHouses();
            await this.fetchTasks();
            await this.fetchContractors();
            await this.fetchSuggestions();
            //make house-modal update itself.
            if (this.house.houseID) {
                //re-assigning house allows showing updated information in houseDetails - after update.
                this.house = this.getHouse(this.house.houseID) || { tasks: [] };
            }
            if (this.task.taskID) {
                //re-assigning task, allows for updated information to be fetched.
                this.task = await this.getTask(this.task.taskID) || this.tasks.find(t => t.taskID == this.task.taskID) || { contractors: [] } ;
            }
            if(this.contractor.contractorID){
                this.contractor = this.contractors.find(c=>c.contractorID == this.contractor.contractorID) || {};
                if(this.contractor.contractorID) this.contractor = await this.getContractor(this.contractor.contractorID);
            }

        },
        async fetchHouses() {
            try {
                this.houses = (await (await fetch("/house")).json()).content
            } catch (err) {
                console.error("NO HOUSES");
                this.houses = [];
            }
        },
        async fetchTasks() {

            try {
                const initial_length = this.tasks.length;

                this.tasks = (await (await fetch("/task")).json()).content;

                //if there is a selected house for filtering (filteredTasks have a length, not equal to the initial length of tasks.)
                if (this.filteredTasks.length != initial_length) {
                    /**
                     * @type {string} houseID used to filter tasks in taskWrapper
                     */
                    const id_for_filter = this.filteredTasks[0].houseID;
                    if (!id_for_filter) this.filteredTasks = this.tasks;

                    this.filteredTasks = this.tasks.filter(t => t.houseID == id_for_filter);
                }
                else this.filteredTasks = this.tasks;

            } catch (err) {
                console.error("no tasks");
                this.tasks = [];
                this.filteredTasks = [];
            }
        },
        async fetchContractors() {
            try {
                this.contractors = (await (await fetch("/contractor")).json()).content

            } catch (err) {
                console.log("no contractors");
                this.contractors = [];
            }
        },
        async fetchSuggestions() {
            try {
                this.suggestions = (await (await fetch("/task/suggestion")).json()).content;

                //make a suggestion functionally the same as a task...
                this.suggestions.forEach(s=>{
                    s.taskID = s.suggestionID;
                });
                // console.log(this.suggestions);
            } catch (err) {
                console.log("no suggestions");
                this.suggestions = [];
            }
        },

        filterTasksBy(group, houseID) {
            //if no houseID - output is unfiltered according to tasks
            
            if(group=="tasks") {
                if(!houseID) return this.tasks;
                return this.tasks.filter(t=>t.houseID == houseID);
            }
                
            if(group=="suggestions") {
                if(!houseID) return this.suggestions;
                return this.suggestions.filter(t=>t.houseID == houseID);
            }
            
        },

        /**
         * Retreives the house from houses-array, with tasks mapped to it.
         * @param {string} house houseID
         * @returns {house} hosue
         */
        getHouse(house) {
            const h = this.houses.find(h => h.houseID == house);
            //if no house was found with the id, then "empty house" is returned
            if (!h) return { tasks: [] };

            h.tasks = this.tasks.filter(t => t.houseID == house);
            return h;
        },
        /**
         * Retreives the task from taks-array, with it's contractors fetched (hence async)
         * @param {string} task taskID 
         * @returns {Promise<task>} the task
         */
        async getTask(task) {
            const t = this.filteredTasks.find(t => t.taskID == task);
            if (!t) return { contractors: [] }


            const appointees = await (async () => {
                try {
                    return (await (await fetch(`/task/appointee/${task}`)).json()).content || [];
                } catch {
                    return []
                }
            })();
            console.log(`appointees for task ${task} : `, appointees);
            t.contractors = appointees;

            return t
        },
        /**
         * retreives the contractor from the contractors-array, with suggestions mapped to it.
         * @param {string} contractor contractor id 
         * @returns {contractor} the contractor
         */
        getContractor(contractor){
            const c = this.contractors.find(ct=>ct.contractorID == contractor)
            if(!c) return {suggestions: []};
            //select all suggestions this user has created. (unsure if i will display them...)
            c.suggestions = this.suggestions.filter(s=>s.contractorID == contractor);
            return c;
        }
    }
}