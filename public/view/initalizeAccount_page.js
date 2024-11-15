import { root } from "./elements.js";
import { addCategoryForm, deleteCategory, editCategory, submitInitialInfo } from "../controller/accountinitialization_controller.js";

export async function initializeAccountView(){
    const resp = await fetch('/view/templates/account_initialization_page_template.html', { cache: 'no-store' });
    const template = await resp.text();
    
    
    
   
    const div = document.createElement('div');
    
    div.innerHTML = template;
    
    const addNewForm = div.querySelector('#addCategoryForm');
    addNewForm.onsubmit = addCategoryForm;

    const editCategoryModal = div.querySelector('#editcategoryModal');
    
  

    const nextButton = div.querySelector('#nextButton');
    nextButton.onclick = submitInitialInfo;

    const editCategoryBtns = div.querySelectorAll('.edit');
    const deleteCategoryBtns = div.querySelectorAll('.delete');
    editCategoryBtns.forEach(btn => btn.onclick = editCategory);
    deleteCategoryBtns.forEach(btn => btn.onclick = deleteCategory);

    root.innerHTML = '';
    root.appendChild(div);
}