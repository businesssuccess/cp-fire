// Ensure Firebase is loaded before running this script
if (firebase && firebase.apps.length === 0) {
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Function to create or update a prospect
  function createOrUpdateProspect(contact) {
    return new Promise((resolve, reject) => {
      const emailKey = contact.email.replace(/\./g, '-'); // Retain @ in email key
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
    const currentDateTime = new Date().toISOString(); // Get current date and time

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
  window.processEvent = function(profile, eventName, eventAction) {
    console.log(`Event: ${eventName}, Action: ${eventAction}`);
    
    // Dummy contact object for testing; replace with real data in production
    const contact = {
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe",
      phone: "123-456-7890",
      shipping_address: "123 Main St",
      shipping_city: "Anytown",
      shipping_state: "State",
      shipping_country: "Country",
      zip: "12345"
    };
    
    createOrUpdateProspect(contact).then(() => {
      logEvent(contact.email.replace(/\./g, '-'), eventName, eventAction);
    }).catch((error) => {
      console.error("Error in processEvent:", error);
    });
  };

  // Initialize Firebase App Check (if necessary)
  function initializeAppCheckFunc() {
    console.log("Initializing App Check...");
    const appCheck = firebase.appCheck();
    appCheck.activate('your-app-check-site-key', true);
    console.log("App Check initialized.");
  }

  document.addEventListener('DOMContentLoaded', function() {
    try {
      initializeAppCheckFunc();
    } catch (error) {
      console.error("App Check initialization failed:", error);
    }
  });
} else {
  console.error("Firebase SDK not found or already initialized.");
}
