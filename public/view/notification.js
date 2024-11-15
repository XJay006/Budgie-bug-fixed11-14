import { app } from "../controller/firebase_core.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { currentUser } from "../controller/firebase_auth.js";

const db = getFirestore(app);

export function showNotifications() {
  if (!currentUser) return;

  const notificationButton = document.getElementById("notificationButton");
  const notificationCountElement = document.getElementById("notificationCount");
  const notificationContainer = document.getElementById("notificationContainer");

  // Ensure the notification button exists
  if (!notificationButton) return;

  // Use Firestore onSnapshot for real-time updates
  const q = query(
    collection(db, "notifications"),
    where("userEmail", "==", currentUser.email),
    where("read", "==", false),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Update notification count
    const unreadCount = notifications.length;
    if (unreadCount > 0) {
      notificationCountElement.textContent = unreadCount;
      notificationCountElement.style.display = "inline-block";
      notificationButton.style.display = "inline-block"; // Show the bell icon
    } else {
      notificationCountElement.textContent = "";
      notificationCountElement.style.display = "none";
      // Optionally hide the bell icon if no notifications
      // notificationButton.style.display = "none";
    }

    // Build notification list
    notificationContainer.innerHTML = '';

    if (notifications.length > 0) {
      notifications.forEach((notification) => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('dropdown-item', 'd-flex', 'align-items-start');

        notificationItem.innerHTML = `
          <div class="flex-grow-1">
            <p class="mb-0">${notification.message}</p>
            <small class="text-muted">${new Date(notification.timestamp.toDate()).toLocaleString()}</small>
          </div>
          <button class="btn btn-sm btn-link text-decoration-none ms-2 mark-as-read-btn" data-id="${notification.id}">
            Mark as Read
          </button>
        `;

        notificationContainer.appendChild(notificationItem);
      });

      // Attach event listeners to "Mark as Read" buttons
      notificationContainer.querySelectorAll('.mark-as-read-btn').forEach((button) => {
        button.addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevent dropdown from closing
          const notificationId = e.target.getAttribute('data-id');
          await markNotificationAsRead(notificationId);
        });
      });
    } else {
      // Display "No notifications" message
      const noNotificationsItem = document.createElement('div');
      noNotificationsItem.classList.add('dropdown-item', 'text-center', 'text-muted');
      noNotificationsItem.textContent = 'No notifications';
      notificationContainer.appendChild(noNotificationsItem);
    }
  });
}

export async function markNotificationAsRead(notificationId) {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
}

export async function addDummyNotification() {
  if (!currentUser) {
    console.error("User not signed in.");
    return;
  }

  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userEmail: currentUser.email,
      message: "This is a test notification!",
      timestamp: Timestamp.now(),
      read: false,
      // Add any other fields your application uses
    });
    console.log("Dummy notification added.");
  } catch (error) {
    console.error("Error adding dummy notification:", error);
  }
}
