//event used to re-trigger fetching users. used after delete and insert
const userChangedEvent = new Event("userChanged");

async function deleteUser(id){
    try {
        const res = await fetch(`/administrator/user/${id}`, {
            method:"DELETE"
        });
        const json = await res.json();

        if(res.ok){
            window.dispatchEvent(userChangedEvent);
            console.log(json.content);
        }
    } catch (err) {
        console.error(`unable to delete user ${id}: `, err);
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
            window.dispatchEvent(userChangedEvent);
            console.log("created user: ", json.content);
            target.reset();
        }
        else console.error("unable to create user", json.content);

    } catch (err) {
        console.error(`unable to create user: `, err);
    }
}


function view(){
    return {
        users : [],
        user:{houses:[], contractors:[]},
        async fetchUsers(){
            try {
                const res = await fetch("/administrator/user");
                const users = (await res.json()).content
                this.users = users;
                this.user = {houses:[], contractors:[]};
            } catch (err) {
                console.log("unable to fetch users: ", err)
            }
        },
        async fetchUserDetails(id){
            try {
                const res = await fetch(`/administrator/user/${id}`);
                const json = await res.json();
                console.log("json @ userDetails()  : ", json);
                this.user=json.content;

            } catch (err) {
                console.log(`unable to fetch user details of id=${id} :`, err)
                
            }
        }
    }
}