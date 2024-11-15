import {
    getFirestore,
    collection, addDoc,
    query, where, orderBy, getDocs, deleteDoc, doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js"
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

import { app } from "./firebase_core.js";
import { currentUser } from "./firebase_auth.js";
import { User } from "../model/User.js";
import { Category } from "../model/category.js";

//add collection names here
const userCollection = 'users';
const categoriesCollection = 'categories';
const householdCollection = 'household';
const incomeSourceCollection = 'incomeSource';
const expenseSourceCollection = 'expenseSource';
const photoCollection = 'profile_pictures/'


const db = getFirestore(app);
const storage = getStorage(app);

/*
export async function addInitailCategoryToFirebase(category) {
    await addDoc(collection(db, categoriesCollection), category);
}
*/

export async function addInitailCategoryToFirebase(categoryData) {
    console.log("hello", categoryData);
    const category = new Category({
        ...categoryData,
        notificationThresholds: categoryData.notificationThresholds || [80, 100],
        thresholdsNotified: {},
    });
    await addDoc(collection(db, categoriesCollection), category.toFireStore());
}

export async function seedAverageMonthlyIncome(data) {

    await addDoc(collection(db, incomeSourceCollection), data);
}

export async function addIncomeSource(data) {
    await addDoc(collection(db, incomeSourceCollection), data);
}

export async function fetchIncomeSourceData() {
    const q = query(collection(db, incomeSourceCollection), where('user', '==', currentUser.email), orderBy('timestamp'));
    const querySnapshot = await getDocs(q);
    const incomeSourceData = querySnapshot.docs.map(doc => {
        return { ...doc.data(), docId: doc.id };
    });
    return incomeSourceData;
}

export async function fetchIncomeSourceDataById(docId) {
    const docRef = doc(db, incomeSourceCollection, docId);
    const docSnap = await getDocs(docRef);
    return { ...docSnap.data(), docId: docSnap.id };
}

export async function deleteIncomeSource(docId) {
    await deleteDoc(doc(db, incomeSourceCollection, docId));
}

export async function updateIncomeSource(docId, data) {
    // requerying here is a little silly, but maybe it's better than passing the document around through several functions

    const docRef = doc(db, incomeSourceCollection, docId);
    await updateDoc(docRef, data);
}

export async function addExpenseSource(data) {
    await addDoc(collection(db, expenseSourceCollection), data);
}

export async function fetchExpenseSourceData() {
    const q = query(collection(db, expenseSourceCollection), where('user', '==', currentUser.email), orderBy('timestamp'));
    const querySnapshot = await getDocs(q);
    const expenseSourceData = querySnapshot.docs.map(doc => {
        return { ...doc.data(), docId: doc.id };
    });
    return expenseSourceData;
}

export async function fetchExpenseSourceDataById(docId) {
    const docRef = doc(db, expenseSourceCollection, docId);
    const docSnap = await getDocs(docRef);
    return { ...docSnap.data(), docId: docSnap.id };
}

export async function deleteExpenseSource(docId) {
    await deleteDoc(doc(db, expenseSourceCollection, docId));
}

export async function addUser(user) {
    await addDoc(collection(db, userCollection), user.toFirestore());
}


export async function getUserInfo(email) {
    let userInfo = [];
    console.log(`Fetching user info for email: ${email}`);
    const q = query(collection(db, userCollection),
        where('email', '==', email),
        //orderBy('timestamp'),
    );
    const snapShot = await getDocs(q);
    console.log(`Documents found: ${snapShot.docs.length}`); // Log the number of documents found

    snapShot.forEach(doc => {
        const item = new User(doc.data(), doc.id);
        userInfo.push(item);
    });
    return userInfo;
}

export async function updateExpenseInFirestore(docId, update) {
    const expenseInfo = await fetchExpenseSourceData();
    console.log("THis is expen info: ", expenseInfo)

    try {
        // const docId = expenseInfo[0].docId;
        console.log("DOCID: ", docId)

        const docRef = doc(db, expenseSourceCollection, docId);
        await updateDoc(docRef, update);

        return { success: true, message: 'Expense updated successfuly' };
    } catch (error) {
        throw new Error('Error updating expense: ' + error.message);
    }
}

export async function updateUserInFirestore(email, update) {
    const userInfo = await getUserInfo(email);

    if (userInfo.length > 0) {
        const docId = userInfo[0].docId;
        const docRef = doc(db, userCollection, docId);
        await updateDoc(docRef, update);

        return { success: true, message: 'User updated successfuly' };
    } else {
        throw new Error('User not found');
    }
}


export async function uploadProfilePhoto(file, email) {
    if (!file) throw new Error("No file selected");
    const storageRef = ref(storage, `${photoCollection}${email}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
}

export async function deleteProfilePhoto(url) {
    const storage = getStorage();
    const fileRef = ref(storage, url); // Create a reference to the file to delete

    try {
        await deleteObject(fileRef);
        console.log("Profile photo deleted successfully.");
    } catch (error) {
        console.error("Error deleting profile photo:", error);
        throw error;
    }
}

export async function getProfilePhoto(email) {
    const storageRef = ref(storage, `profile_pictures/${email}/`);
    try {
        const result = await listAll(storageRef);

        if (result.items.length > 0) {
            const firstPhotoRef = result.items[0];
            const downloadURL = await getDownloadURL(firstPhotoRef);
            return downloadURL;
        } else {
            const defaultImageURL = 'https://t4.ftcdn.net/jpg/03/59/58/91/360_F_359589186_JDLl8dIWoBNf1iqEkHxhUeeOulx0wOC5.jpg';
            return defaultImageURL;
        }
    } catch (error) {
        console.error('Error fetching profile photo:', error);
        throw new Error('Could not fetch profile photo.');
    }
}

export async function fetchUserCategories() {
    const q = query(collection(db, categoriesCollection), where('email', '==', currentUser.email));
    const querySnapshot = await getDocs(q);
    const categories = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const category = new Category({ ...data, docId: doc.id });
        categories.push(category);
    });
    return categories;
}

export async function getNotificationsForUser(email) {
    const q = query(
        collection(db, 'notifications'),
        where('userEmail', '==', email),
        where('read', '==', false),
        orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
        notifications.push({
            id: doc.id,
            ...doc.data(),
        });
    });
    return notifications;
}

export async function markNotificationAsRead(notificationId) {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  }


  export async function updateCategoryThresholds(categoryId, notificationThresholds) {
    const categoryRef = doc(db, categoriesCollection, categoryId);
    await updateDoc(categoryRef, {
        notificationThresholds: notificationThresholds,
    });
}

export async function createHouseHoldFirestore(data) {

}


export async function addHouseholdToFirebase(data){
  await addDoc(collection(db, householdCollection), data);
}

export async function deleteCategory(categoryId) {
    try {
      const categoryRef = doc(db, categoriesCollection, categoryId);
      await deleteDoc(categoryRef);
      console.log(`Category with ID ${categoryId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
