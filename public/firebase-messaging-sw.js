/* Push notifications for app.alke.network (Firebase Cloud Messaging).
   Pushes carry a `notification` payload, which the browser shows by itself,
   and fcmOptions.link, which Firebase opens on a tap. */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDSHwlWQ06WDah-pmzBukRSJAqTm-AwyVk",
  appId: "1:301918770506:web:ecc9d6ac102a030c6b1db3",
  messagingSenderId: "301918770506",
  projectId: "amid-7592b",
});
firebase.messaging();
// A tap opens the push's link (webpush.fcmOptions.link, set by the server).
