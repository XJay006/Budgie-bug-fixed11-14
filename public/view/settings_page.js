import { root } from "./elements.js";
import { currentUser, updateToNewPassword } from "../controller/firebase_auth.js";
import { homePageView } from "./home_page.js";
import { getUserInfo, deleteCategory, updateUserInFirestore, uploadProfilePhoto, getProfilePhoto, deleteProfilePhoto, fetchUserCategories, updateCategoryThresholds } from "../controller/firestore_controller.js";
import { protectedView } from "./protected_view.js";
const MIN_PASSWORD_LENGTH = 6;
const PASSWORD_REGEX = /^.*(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[@1\$&!-_]).{6,18}$/;
const NAME_REGEX = /^[A-Za-z]+$/;

let userInfo = [];
let selectedFile = null;

export async function SettingsPageView() {
  if (!currentUser) {
    root.innerHTML = await protectedView();
    return;
  }

  const response = await fetch('/view/templates/settings_page_template.html', { cache: 'no-store' });

  const divWrapper = document.createElement('div');
  divWrapper.innerHTML = await response.text();

  userInfo = await getUserInfo(currentUser.email);

  // Populate user's original account info 
  const fnameInput = divWrapper.querySelector('#fname');
  const lnameInput = divWrapper.querySelector('#lname');
  const passwordInput = divWrapper.querySelector('#password');
  const emailInput = divWrapper.querySelector('#email');

  fnameInput.value = userInfo[0].fname || '';
  lnameInput.value = userInfo[0].lname || '';
  passwordInput.value = userInfo[0].password;
  emailInput.value = userInfo[0].email;

  // fetch profile photo
  const profilePhotoURL = await getProfilePhoto(currentUser.email);
  const avatarImage = divWrapper.querySelector('.avatar');
  avatarImage.src = profilePhotoURL;

   // Set up event listeners for uploading new profile photo
   const fileInput = divWrapper.querySelector('#formFile');
   const uploadButton = divWrapper.querySelector('#btn-upload-image');
   uploadButton.addEventListener('click', () => {
     fileInput.click();
   });
 
   fileInput.addEventListener('change', async (event) => {
     const file = event.target.files[0];
     if (file) {
       try {
         // Upload the new profile photo
         await uploadProfilePhoto(file, currentUser.email);
 
         // Get the new profile photo URL
         const newProfilePhotoURL = await getProfilePhoto(currentUser.email);
 
         // Update the avatar image
         avatarImage.src = newProfilePhotoURL;
 
         alert('Profile photo updated successfully.');
       } catch (error) {
         console.error('Error uploading profile photo:', error);
         alert('Error uploading profile photo. Please try again.');
       }
     }
   });

  // Fetch and render categories
  const categories = await fetchUserCategories();
  renderCategories(divWrapper, categories);

  root.innerHTML = '';
  root.appendChild(divWrapper);
}

function renderCategories(divWrapper, categories) {
  const categoryList = divWrapper.querySelector('#categoryList');
  const categoryTemplateHtml = divWrapper.querySelector('#categoryTemplate').innerHTML;

  categories.forEach(category => {
    const thresholdsValue = category.notificationThresholds ? category.notificationThresholds.join(',') : '';

    const categoryHtml = categoryTemplateHtml
      .replace(/{{categoryId}}/g, category.docId)
      .replace(/{{categoryName}}/g, category.name)
      .replace(/{{amountBudgeted}}/g, category.amountBudgeted)
      .replace(/{{thresholds}}/g, thresholdsValue);

    const categoryElement = document.createElement('div');
    categoryElement.innerHTML = categoryHtml;

    // Attach event listener to "Save Thresholds" button
    const saveButton = categoryElement.querySelector('.save-thresholds-btn');
    saveButton.addEventListener('click', async () => {
      const thresholdsInput = categoryElement.querySelector('.thresholds-input').value;
      const notificationThresholds = processNotificationThresholds(thresholdsInput);

      if (notificationThresholds.length === 0) {
        alert('Please enter valid thresholds between 1 and 100.');
        return;
      }

      try {
        await updateCategoryThresholds(category.docId, notificationThresholds);
        alert(`Thresholds updated for ${category.name}.`);
      } catch (error) {
        console.error('Error updating thresholds:', error);
        alert('Error updating thresholds. Please try again.');
      }
    });

    // Attach event listener to "Delete Category" button
    const deleteButton = categoryElement.querySelector('.delete-category-btn');
    deleteButton.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
        try {
          await deleteCategory(category.docId);
          // Remove the category card from the DOM
          const categoryCard = document.getElementById(`category-card-${category.docId}`);
          categoryCard.remove();
          alert(`Category "${category.name}" has been deleted.`);
        } catch (error) {
          console.error('Error deleting category:', error);
          alert('Error deleting category. Please try again.');
        }
      }
    });

    categoryList.appendChild(categoryElement);
  });
}



function processNotificationThresholds(inputString) {
  const thresholds = inputString
    .split(',')
    .map(str => parseFloat(str.trim()))
    .filter(num => !isNaN(num) && num > 0 && num <= 100);

  const uniqueThresholds = [...new Set(thresholds)].sort((a, b) => a - b);
  return uniqueThresholds;
}
