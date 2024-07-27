// Load Firebase App and Database
import firebase from "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4h7CLTXk4nZ_4-oB7Jva_tpLGT9OtfrU",
  authDomain: "cf-obvio-link.firebaseapp.com",
  databaseURL: "https://cf-obvio-link-default-rtdb.firebaseio.com",
  projectId: "cf-obvio-link",
  storageBucket: "cf-obvio-link.appspot.com",
  messagingSenderId: "795544771056",
  appId: "1:795544771056:web:29fd38b91b33eb5f78e535",
  measurementId: "G-98YVR7FK88"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Minimal function
window.processEvent = function(profile, eventName, eventAction) {
  console.log(`Event: ${eventName}, Action: ${eventAction}`);
  // Add any necessary Firebase operations here
};
