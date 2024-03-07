//used to signify when to toggle visibility of Verify form
const pwl_loggedIn_Event = new Event("showVerify");

//used to show error text in body
const error_Event = new Event("authError")

//used to send a login request using stateful authentication
async function login(target){
    console.log(target);


    // console.log(target.password.value);
    // console.log(target.email.value);
    const body = {
        password: target.password.value || null,
        email : target.email.value || null
    };
    // console.log(body);
    const res = await fetch("/auth/login", {
        method: "POST",
        body:JSON.stringify(body),
        headers:{
            "Content-Type" : "application/json"
        }
    });

    console.log(await res.json());
    if(res.ok) window.location.replace("/");
    else window.dispatchEvent(error_Event);
};

//used to send a login request using passwordless authentication
async function login_pwl(target){
    // console.log(target)
    const email = target.email.value || null;
    // console.log("email : ", email);
    const res = await fetch("/auth/login_pwl", {
        method:"POST",
        body:JSON.stringify({email}),
        headers:{
            "Content-Type":"application/json"
        }
    });

    console.log(await res.json());
    if(res.ok) target.dispatchEvent(pwl_loggedIn_Event);
    else {
        window.dispatchEvent(error_Event);
        
    }

}

async function verify_pwl(target){
    const code = target.code.value || null;
    console.log("code: ", code);

    const res = await fetch("/auth/verify_pwl", {
        method:"POST",
        body:JSON.stringify({code}),
        headers:{
            "Content-Type" : "application/json"
        }
    });
    console.log(await res.json());
    if(res.ok) {
        window.location.replace("/worker")
    }
    else {
        window.dispatchEvent(error_Event);

    }
}