/**
 * Toggles the sidebar
 */
document.querySelector('#expandButton').addEventListener('click', function (ev) {

    //Classes `sidebar` and `pushable` changes the location of contents. 

    // the class alters `transform:` style and pushes the content in, or out of space. 
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    const pushable = document.querySelector('.pushable');
    pushable.classList.toggle('pushed');
    document.querySelector('.overlay').classList.toggle('pushed');

    //the "pushed" part should have a click/event for "dismissing" the sidebar.
    //this is placed in a timeout of 0 seconds, because otherwise, the eventListener on '.pushable' will be able to trigger on the same click that opened the sidebar.
    //Result -> Sidebar opens because of click, INSTANTLY trigger close event.
    setTimeout(() => {
        //this is done with a named function, as we want to de-list the event after clicking. (which is impossible with anonymous functions/lambda...)
        pushable.addEventListener('click', toggleSidebar);
    }, 0);
});

/**
 * Toggles the sidebar again, by toggling classes AND removing the event-listener. 
 */
function toggleSidebar() {
    const pushable = document.querySelector('.pushable');
    pushable.removeEventListener('click', toggleSidebar);
    document.querySelector('.sidebar').classList.toggle('active');
    pushable.classList.toggle('pushed')
    document.querySelector('.overlay').classList.toggle('pushed');
}

//profile change for contractors
document.querySelector('#profileID')?.addEventListener('change', swapProfile);

async function swapProfile(ev) {
    try {
        console.log(ev.target);

        newID = ev.target.value;

        const body = { newID, isApi: true };
        console.log(body);
        const res = await fetch("/auth/change_profile", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }

        });

        console.log(res);

        const data = await res.json();
        if (res.ok) {
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