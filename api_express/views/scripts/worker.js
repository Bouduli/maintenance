const updateTaskEvent = new Event("updateTask");

async function makeSuggestion(target){
    try {
        console.log(target.houseID.value);

        const body = {
            houseID : target.houseID.value || null,
            description : target.description.value || null,
            
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
            target.reset();
        }
    } catch (err) {
        console.error("couldn't send suggestion: ", err);   
    }
}

async function markComplete(id, completed, target){
    console.log("taskID: ", id);
    console.log("is_completed: ", completed);

    const body = {
        completed: Boolean(!completed)
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
        window.dispatchEvent(updateTaskEvent);
    }

}

function view(){

    return {
        tab:"#tasks",
        houses:[],
        suggested_tasks:[],

        //fetch data
        async fetchData(){
            try {
                const res = await fetch(`/worker/data`);
                const json = await res.json();

                if(res.ok){
                    //all houses a contractor have been appointed tasks are set.
                    this.houses = json.content

                    //sort them with ascending houseID
                    this.houses.sort((a,b)=>a.houseID-b.houseID)

                    console.log("houses: ", this.houses);
                }
                else {
                    console.log(json);
                }

            } catch (err) {
                console.log("unable to fetch tasks: ", err);
            }
        }
    }
}