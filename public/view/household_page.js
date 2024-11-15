import { goToCreateHouseholdForm, addHouseholdMember, createhouseHoldName, submitHouseHold } from "../controller/household_controller.js";
import {root } from "./elements.js";

export async function householdPageView() {
    const response = await fetch('/view/templates/household_page_template.html', {
        cache: 'no-store'
    });
    const divWrapper = document.createElement('div');
    divWrapper.style.width = "400px";
    divWrapper.classList.add("m-4", "p-4");
    divWrapper.innerHTML = await response.text();

    const noHouseHoldOption = divWrapper.querySelector('#noHouseholdDiv');
    const goTocreateHouseholdBtn = divWrapper.querySelector('#goToHouseholCreationForm');
    goTocreateHouseholdBtn.onclick = goToCreateHouseholdForm;

    
    const createHouseholdForm = divWrapper.querySelector('form');
    createHouseholdForm.onsubmit = createhouseHoldName;
    const addMemberBtn = divWrapper.querySelector('#addmemberBtn');
    addMemberBtn.onclick = addHouseholdMember;

    const submitMemberBtn = divWrapper.querySelector('#submitHouseholdMembers');
    submitMemberBtn.classList.add('disabled');
    submitMemberBtn.onclick = submitHouseHold;
    

    root.innerHTML = ''; // Clear current page rendering
    root.appendChild(divWrapper);

}