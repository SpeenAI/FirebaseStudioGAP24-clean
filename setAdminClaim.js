const admin = require('firebase-admin');

// Pfad zu Ihrer Dienstkonto-Schlüsseldatei
// Stellen Sie sicher, dass diese Datei SICHER ist und nicht öffentlich zugänglich ist!
const serviceAccount = require('./serviceAccountKey.json');

// Initialisieren Sie das Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Die UID des Benutzers, den Sie zum Admin machen möchten
const adminUid = 'c0KdppRq1yeplOKyAvzQoQZotC72'; // Ihre Admin-UID

async function setAdminClaim() {
  try {
    // Setzen Sie die benutzerdefinierten Claims für den Benutzer
    await admin.auth().setCustomUserClaims(adminUid, { admin: true });

    // Force token refresh (optional, aber empfohlen für sofortige Wirkung)
    // Dies ist wichtig, damit die neuen Claims sofort wirksam werden.
    const user = await admin.auth().getUser(adminUid);
    await admin.auth().revokeRefreshTokens(user.uid);

    console.log(`Benutzer ${adminUid} wurde erfolgreich die Admin-Rolle zugewiesen.`);
    console.log("Bitte beachten Sie: Der Benutzer muss sich möglicherweise neu anmelden, damit die Änderungen wirksam werden.");
  } catch (error) {
    console.error("Fehler beim Zuweisen der Admin-Rolle:", error);
  }
}

setAdminClaim();
