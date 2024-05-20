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


async function swapProfile(target){
    try {
        console.log(target);

        newID = target.profile.value;

        const body = {newID, isApi:true};
        console.log(body);
        const res = await fetch("/auth/change_profile", {
            method:"POST",
            body: JSON.stringify(body),
            headers:{
                "Content-Type": "application/json"
            }
            
        });

        console.log(res);

        const data = await res.json();
        if(res.ok){
            console.log("successfully swapped ", data.content);
            location.reload();
        }
        else {
            console.error("unsuccessful swap: ", data.content);
        }

    } catch (err) {
        console.error(err);
    }
}
function view(){

    return {
        tab:'',
        modal:false,
        subtab:"taskWrapper",

        profiles: [],

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
                //being able to switch profiles
                await this.fetchProfiles();


                await this.fetchHouses();
                await this.fetchTasks();
                await this.fetchSuggestions();
                if(this.house.houseID) this.house = await this.getHouse(this.house.houseID);
                if(this.task.taskID) this.task = await this.getTask(this.task.taskID);
                // console.log("houses: ", this.houses);
                // console.log("tasks: ", this.tasks);
                // console.log("suggestions: ", this.suggestions);

                this.tasks.forEach(t=>{
                    if(!this.houses.find(h=>h.houseID == t.houseID))
                        this.houses.push(t.houseID);
                })
                this.filteredTasks = this.tasks;
            } catch (err) {
                console.log("unable to fetch tasks: ", err);
            }
        },
        async fetchProfiles(){
            try {
                const res = await fetch("/worker/profiles");
                const json = await res.json();

                if(res.ok){
                    this.profiles = json.content;

                }
                else {
                    this.profiles = [];
                }
            } catch (err) {
                console.log(err);
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
                // console.log(t);
                //endpoint is different depending on if it's a task or a suggestion. 
                const endpoint = this.filterGroup =='tasks'? 'task' : 'suggestion';
                const res = await fetch(`/worker/${endpoint}/${t}`)
                const json = await res.json();

                if(res.ok){
                    // console.log("task:", json.content);
                    return json.content
                }
                else this.task=false;
            } catch (err) {

                console.log(err);
                this.task = false;
            }
        },
        async fetchSuggestions(){
            try {
                const res = await fetch("/worker/suggestion");
                const json = await res.json();

                if(res.ok){
                    this.suggestions = json.content;
                    //make suggestions functionally equivalent to tasks
                    this.suggestions.forEach(t=>{
                        t.taskID = t.suggestionID;
                    });
                }
                else this.suggestions = [];
            } catch (err) {
                console.log(err);
                this.suggestions = [];
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