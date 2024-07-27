// Ensure Firebase is loaded before running this script
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
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

  // Function to create or update a prospect
  function createOrUpdateProspect(contact) {
    return new Promise((resolve, reject) => {
      const emailKey = contact.email.replace(/\./g, '-');
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
            resolve();
          }).catch((error) => {
            console.error("Error creating prospect:", error);
            reject(error);
          });
        } else {
          console.log("Updating existing prospect...");
          const updates = {};
          const prospectData = snapshot.val();

          Object.keys(contactData).forEach(field => {
            if (contactData[field] !== prospectData[field] && contactData[field] !== 'Unknown') {
              updates[field] = contactData[field];
            }
          });

          prospectRef.update(updates).then(() => {
            console.log("Prospect updated successfully.");
            resolve();
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

  // Function to log an event
  function logEvent(contactId, eventName, eventAction) {
    const eventRef = firebase.database().ref('prospects/' + contactId + '/events/' + eventName);
    const currentDateTime = new Date().toISOString();

    eventRef.set({
      eventAction: eventAction,
      timestamp: currentDateTime
    }).then(() => {
      console.log("Event logged successfully.");
    }).catch((error) => {
      console.error("Error logging event:", error);
    });
  }

  // Making the functions globally accessible
  window.processEvent = function(profile, eventName, eventAction, contact) {
    console.log(`Event: ${eventName}, Action: ${eventAction}`);
    createOrUpdateProspect(contact).then(() => {
      logEvent(contact.email.replace(/\./g, '-'), eventName, eventAction);
    }).catch((error) => {
      console.error("Error in processEvent:", error);
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    console.log("Firebase SDK loaded and ready.");
  });
} else {
  console.error("Firebase SDK not found or already initialized.");
}
