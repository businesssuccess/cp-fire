// Minimal Firebase Initialization
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

firebase.initializeApp(firebaseConfig);

// Minimal function
window.processEvent = function() {
  console.log("processEvent function is available.");
};
