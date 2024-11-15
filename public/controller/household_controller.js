import { currentUser } from "./firebase_auth.js";
import { addHouseholdToFirebase } from "./firestore_controller.js";



export function goToCreateHouseholdForm(e) {
    e.preventDefault();
    console.log('Going To form');

    const parentDiv = e.currentTarget.parentElement.parentElement;
    parentDiv.children[0].classList.add('d-none'); // Hide the no household div
    parentDiv.children[1].classList.remove('d-none'); // Show the create household div

}

export function createhouseHoldName(e) {
    e.preventDefault();
    e.currentTarget.inert = true; // Disable the button

    const householdNameField = document.querySelector('#ShowHouseHoldName');
    householdNameField.innerText = e.currentTarget[0].value;
    if (householdNameField == null  ){
        return;
    }

    const form = document.querySelector('form');
    form.classList.add('d-none'); // Hide the form after submission
    householdNameField.parentElement.classList.remove('d-none'); // Show the household name
    const submitMemberBtn = document.querySelector('#submitHouseholdMembers');
    submitMemberBtn.classList.remove('disabled'); // Enable the submit button
    console.log('Creating Household');
}

export function deleteMember(e) {
    e.preventDefault();
    console.log('Deleting Member');
    let row = e.target.parentElement.parentElement;
    row.remove();
}

export function addHouseholdMember(e) {
    e.preventDefault();
    let newMember = window.prompt('Enter new household members email');

    if (newMember != null) {
        let table = e.currentTarget.parentElement.parentElement.children[0];
        
        let rows = table.querySelectorAll('tr');

        let template =
            `<tr><td>${newMember}</td><td><button class="delete btn btn-danger">Delete</button></td></tr>`;

        table.children[1].innerHTML += template;

        const deleteBtns = document.querySelectorAll('.delete');
        deleteBtns.forEach(btn => {
            btn.onclick = deleteMember;
        });


        console.log('Adding Household Member:', newMember);
    }

}

export async function submitHouseHold(e){
    e.preventDefault();
    const householdName = document.querySelector('#ShowHouseHoldName').innerText;
    const table = e.currentTarget.parentElement.parentElement.children[0];
    let members = [];
    members.push(currentUser.email);

    for (let row of table.rows) {
        if (row == table.rows[0]) {
            continue; // Skip header row
        }
        let memberEmail = row.cells[0].textContent;
        members.push(memberEmail);
    }
    if (members.length < 2){
        alert('Please add at least one member to the household');
        return;
    }
    let householdData ={ householdName: householdName, creator: currentUser.email, members: members};
    await addHouseholdToFirebase(householdData);
    console.log('Household Created:', householdData);

    const createHouseholdDiv = document.querySelector('#createHouseHoldDiv');
    createHouseholdDiv.classList.add('d-none');

    const hasHouseholdDiv = document.querySelector('#hasHouseholdDiv');
    hasHouseholdDiv.classList.remove('d-none');



}
