import { app } from "./firebase_core.js";
import { getFirestore, doc, updateDoc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { currentUser } from "./firebase_auth.js";

const db = getFirestore(app);

export async function checkAndCreateNotifications(categoryId) {
    if (!currentUser) {
        console.error("User not signed in.");
        return;
    }
    try {
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            console.error("Category does not exist!");
            return;
        }

        const categoryData = categorySnap.data();

        const amountBudgeted = parseFloat(categoryData.amountBudgeted);
        const amountSpent = parseFloat(categoryData.amountSpent);

        const notificationThresholds = categoryData.notificationThresholds || [80, 100];
        let thresholdsNotified = categoryData.thresholdsNotified || {};

        let updates = {};
        let notificationsToCreate = [];

        for (const threshold of notificationThresholds) {
            const thresholdKey = threshold.toString();
            const thresholdAmount = (amountBudgeted * threshold) / 100;

            if (amountSpent >= thresholdAmount) {
                if (!thresholdsNotified[thresholdKey]) {
                    // Mark as notified
                    thresholdsNotified[thresholdKey] = true;
                    updates[`thresholdsNotified.${thresholdKey}`] = true;

                    // Add to notifications to create
                    notificationsToCreate.push({
                        userEmail: currentUser.email,
                        message: `You have spent ${threshold}% of your budget in ${categoryData.name}.`,
                        timestamp: new Date(),
                        read: false,
                        categoryId: categoryId,
                    });
                }
            } else {
                if (thresholdsNotified[thresholdKey]) {
                    // Reset the notified flag
                    thresholdsNotified[thresholdKey] = false;
                    updates[`thresholdsNotified.${thresholdKey}`] = false;
                }
            }
        }

        // Update the category document if there are changes
        if (Object.keys(updates).length > 0) {
            await updateDoc(categoryRef, updates);
        }

        // Create notifications if needed
        const notificationsRef = collection(db, "notifications");

        for (const notificationData of notificationsToCreate) {
            await addDoc(notificationsRef, notificationData);
        }
    } catch (error) {
        console.error("Error checking notifications:", error);
    }
}
