
async function login(target){
    console.log(target);


    // console.log(target.password.value);
    // console.log(target.email.value);
    const body = {
        password: target.password.value || null,
        email : target.email.value || null
    };
    console.log(body);
    const res = await fetch("/auth/login", {
        method: "POST",
        body:JSON.stringify(body),
        headers:{
            "Content-Type" : "application/json"
        }
    });

    console.log(await res.json());
    if(res.ok) window.location.replace("/")
};

async function pwl_login(target){
    // console.log(target)
    const email = target.email.value || null;
    console.log("email : ", email);
    const res = await fetch("/auth/login_pwl", {
        method:"POST",
        body:JSON.stringify({email}),
        headers:{
            "Content-Type":"application/json"
        }
    });

    console.log(await res.json());
    if(res.ok);
    
}