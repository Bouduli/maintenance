const dataChangeEvent = new Event("dataChange");

async function makeSuggestion(houseID, description){
    try {   
        const body = {
            houseID : houseID || null,
            description : description || null,
            
        };
        const res = await fetch("/worker/task", {
            method:"POST",
            body:JSON.stringify(body),
            headers:{
                "Content-Type" : "application/json"
            }
        });

        const json = await res.json();

        if(res.ok){
            console.log("task_suggested: ", json.content.id);
            return true;
        }
        else console.log(json);
    } catch (err) {
        console.error("couldn't send suggestion: ", err);
        return false;
    }
}

async function markComplete(id, setStatus, target){
    console.log("taskID: ", id);
    console.log("setStatus: ", setStatus);

    const body = {
        completed: setStatus
    };
    
    const res = await fetch(`/worker/task/${id}`, {
        method:"PUT",
        body: JSON.stringify(body),
        headers:{
            "Content-Type": "application/json"
        }
    });

    const json = await res.json();

    if(res.ok){
        // target.parentElement.parentElement.remove();
        window.dispatchEvent(dataChangeEvent);
    }

}

function view(){

    return {
        modal:false,
        subtab:"taskWrapper",

        houses:[],
        house:{},

        tasks: [],
        task: {house: {}},

        filteredTasks:[],
        filterGroup:'tasks',
        filterID:'',


        suggestions:[],
        

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

        //fetch data
        async data(){
            try {
                await this.fetchHouses();
                await this.fetchTasks();
                if(this.house.houseID) this.house = await this.getHouse(this.house.houseID);
                if(this.task.taskID) this.task = await this.getTask(this.task.taskID);
                console.log("houses: ", this.houses);
                console.log("tasks: ", this.tasks);
                this.tasks.forEach(t=>{
                    if(!this.houses.find(h=>h.houseID == t.houseID))
                        this.houses.push(t.houseID);
                })
                this.filteredTasks = this.tasks;
            } catch (err) {
                console.log("unable to fetch tasks: ", err);
            }
        },
        async fetchHouses(){
            try {
                const res = await fetch("/worker/house");
                const json = await res.json();

                if(res.ok) {
                    this.houses = json.content;
                }
                else {
                    this.houses = [];
                }
            } catch (err) {
                console.log(err);
            }
        },
        async fetchTasks(){
            try {
                const init_length = this.tasks.length;


                const res = await fetch(`/worker/task`);
                const json = await res.json();

                if(res.ok){
                    this.tasks = json.content;
                }
                else {
                    this.tasks = [];
                }

                if(this.filteredTasks.length){

                }

            } catch (err) {
                console.log("unable to fetch task:", err);
            }
        },

        async fetchTaskDetails(t){
            try {
                if(!t) return console.error("no id");
                console.log(t);
                const res = await fetch(`/worker/task/${t}`)
                const json = await res.json();

                if(res.ok){
                    console.log("task:", json.content);
                    return json.content


                }
                else this.task=false;
            } catch (err) {

                console.log(err);
                this.task = false;
            }
        },
        async getTask(task) {
            try {
                const t = await this.fetchTaskDetails(task);
                if (!t) return {house: {}};

                return t
            } catch (err) {
                console.log(err)
                return {house: {}};
            }
        },
        getHouse(house){
            const h = this.houses.find(h=>h.houseID == house);
            if(!h) return {};
            return h;
        }
    }
}