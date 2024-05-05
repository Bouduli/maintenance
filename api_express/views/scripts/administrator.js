//event used to re-trigger fetching users. used after delete and insert
const dataChangeEvent = new Event("dataChange");


async function destroy(type, id) {

    // console.log("destroyType: ", type );
    // console.log("destroyId: ", id );

    const url = `/${type}/${id}`;
    // console.log("destroy url : ", url);

    const res = await fetch(url, {
        method: "DELETE"
    })

    const json = await res.json();

    if (res.ok) {
        // console.log(json);
        window.dispatchEvent(dataChangeEvent);
    }
    else {
        console.error(json);

    }

}

async function createUser(target){
    try {
        
        const body = {
            name: target.name.value || null,
            email: target.email.value || null,
            phone: target.phone.value || null,
            password: target.password.value || null,
            admin: target.admin.checked || null
        }
        const res = await fetch("/administrator/user", {
            method:"POST",
            body:JSON.stringify(body),
            headers:{
                "Content-Type": "application/json"
            }
        });

        const json = await res.json();

        if(res.ok){
            window.dispatchEvent(dataChangeEvent);
            // console.log("created user: ", json.content);
            target.reset();
        }
        else console.error("unable to create user", json.content);

    } catch (err) {
        console.error(`unable to create user: `, err);
    }
}


function view(){
    return {
        modal:"false",
        subtab:"userWrapper",

        users : [],
        user:{houses:[], contractors:[]},

        async data(){
            try {
                await this.fetchUsers();

                if(this.user.userID) this.user = await this.getUser(this.user.userID);

            } catch (err) {
                
                console.log("unable to fetch data: ", err);
            }
        },
        async fetchUsers(){

            try {
                const res = await fetch("administrator/user");
                const json = await res.json();

                if(res.ok){
                    this.users = json.content;
                    
                }

            } catch (err) {
                
                console.log("unable to fetch users");
                this.users=[];
            }
            
        },
        async getUser(id){
            try {
                
                const res = await fetch(`/administrator/user/${id}`);
                const json = await res.json();
                if(res.ok){
                    return json.content;
                } else {
                    return {houses:[], contractors:[]};
                }

            } catch (err) {
                console.log("unable to get user details");
                return {houses:[], contractors:[]};

            }
        }
    }
}