// Firebase Registration Script Version
const firebaseRegistrationScriptVersion = '2.1';
console.log(`Firebase Registration Script Version: ${firebaseRegistrationScriptVersion}`);

// Your web app's Firebase configuration
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
console.log("Initializing Firebase...");
firebase.initializeApp(firebaseConfig);

// Function to initialize Firebase App Check
function initializeAppCheckFunc() {
  console.log("Initializing App Check...");
  const appCheck = firebase.appCheck();
  appCheck.activate('your-app-check-site-key', true);
  console.log("App Check initialized.");
}

// Function to get device details
function getDeviceDetails() {
  const userAgent = navigator.userAgent;
  const browser = (function() {
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
    if (userAgent.indexOf("MSIE") > -1 || !!document.documentMode) return "IE";
    return "Unknown";
  })();

  const os = (function() {
    if (userAgent.indexOf("Win") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "MacOS";
    if (userAgent.indexOf("X11") > -1) return "UNIX";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    return "Unknown";
  })();

  const device = /Mobile|Android|iP(hone|od|ad)/.test(userAgent) ? "Mobile" : "Desktop";

  return { browser, os, device };
}

// Function to log an event with a name, action, and timestamp
function logEvent(contactId, eventName, eventAction, contactData) {
  const eventRef = firebase.database().ref(`events/${eventName}/${eventAction}/prospects/${contactId}`);
  const totalCountRef = firebase.database().ref(`events/${eventName}/${eventAction}/totalCount`);
  const currentDateTime = new Date().toISOString(); // Get current date and time

  eventRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      eventRef.set({
        ...contactData,
        timestamp: currentDateTime
      }).then(() => {
        console.log("Event logged successfully.");
        totalCountRef.transaction((currentCount) => (currentCount || 0) + 1);
      }).catch((error) => {
        console.error("Error logging event:", error);
      });
    } else {
      console.log("Prospect already logged for this event action.");
    }
  }).catch((error) => {
    console.error("Error checking event log:", error);
  });
}

// Function to create or update a prospect
function createOrUpdateProspect(contact) {
  return new Promise((resolve, reject) => {
    const emailKey = contact.email.replace(/\./g, '-'); // Retaining @ in email key
    const prospectRef = firebase.database().ref('prospects/' + emailKey);

    const knownFields = ['email', 'first_name', 'last_name', 'phone', 'shipping_address', 'shipping_city', 'shipping_state', 'shipping_country', 'zip'];
    const contactData = {
      Email: contact.email,
      FirstName: contact.first_name || 'Unknown',
      LastName: contact.last_name || 'Unknown',
      Phone: contact.phone || 'Unknown',
      ShippingAddress: contact.shipping_address || 'Unknown',
      ShippingCity: contact.shipping_city || 'Unknown',
      ShippingState: contact.shipping_state || 'Unknown',
      ShippingCountry: contact.shipping_country || 'Unknown',
      ShippingZip: contact.zip || 'Unknown',
      events: {}
    };

    // Include any additional fields from the contact object
    Object.keys(contact).forEach(key => {
      if (!knownFields.includes(key.toLowerCase())) {
        contactData[key] = contact[key];
      }
    });

    prospectRef.once('value').then((snapshot) => {
      if (!snapshot.exists()) {
        console.log("Creating new prospect...");
        prospectRef.set(contactData).then(() => {
          console.log("Prospect created successfully.");
          resolve(contactData);
        }).catch((error) => {
          console.error("Error creating prospect:", error);
          reject(error);
        });
      } else {
        console.log("Updating existing prospect...");
        const updates = {};
        Object.keys(contactData).forEach(field => {
          if (contactData[field] !== snapshot.val()[field] && contactData[field] !== 'Unknown') {
            updates[field] = contactData[field];
          }
        });
        prospectRef.update(updates).then(() => {
          console.log("Prospect updated successfully.");
          resolve(contactData);
        }).catch((error) => {
          console.error("Error updating prospect:", error);
          reject(error);
        });
      }
    }).catch((error) => {
      console.error("Error checking prospect:", error);
      reject(error);
    });
  });
}

// Function to store device details based on IP address under prospect's data
function storeDeviceDetails(emailKey, ipAddress, deviceDetails) {
  const deviceRef = firebase.database().ref(`prospects/${emailKey}/devices/${ipAddress.replace(/\./g, '-')}`);
  
  deviceRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      deviceRef.set(deviceDetails).then(() => {
        console.log("Device details stored successfully.");
      }).catch((error) => {
        console.error("Error storing device details:", error);
      });
    } else {
      deviceRef.update(deviceDetails).then(() => {
        console.log("Device details updated successfully.");
      }).catch((error) => {
        console.error("Error updating device details:", error);
      });
    }
  }).catch((error) => {
    console.error("Error checking device details:", error);
  });
}

// Call the function to initialize App Check and get IP address
document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeAppCheckFunc();
  } catch (error) {
    console.error("App Check initialization failed:", error);
  }

  const contact = {{ contact | json }};
  const emailKey = contact.email.replace(/\./g, '-'); // Retaining @ in email key

  createOrUpdateProspect(contact).then((contactData) => {
    logEvent(emailKey, eventName, eventAction, contactData);

    // Fetch IP address and store device details
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        const ipAddress = data.ip;
        const deviceDetails = getDeviceDetails();
        storeDeviceDetails(emailKey, ipAddress, deviceDetails);
      })
      .catch(error => console.error('Error fetching IP address:', error));
  }).catch((error) => {
    console.error("Error in initial setup:", error);
  });
});

// Ensure the function is accessible globally
window.processEvent = processEvent;

