import { db, collection, getDocs, query, orderBy, addDoc } from '../global/firebase-config.js';

// Set the default date on page load
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const formattedDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    
    document.getElementById("sessionId").value = formattedDate;
});

// Get the form element
const statsForm = document.getElementById('statsForm');

// Add event listener for form submission
statsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const sessionId = document.getElementById('sessionId').value; 
    const gamertag = document.getElementById('gamertag').value;
    const gameId = document.getElementById('gameId').value;
    const landingZone = document.getElementById('landingZone').value;
    const kills = parseInt(document.getElementById('kills').value);
    const assists = parseInt(document.getElementById('assists').value);
    const damage = parseInt(document.getElementById('damage').value);
    const placement = parseInt(document.getElementById('placement').value);

    try {
        // Add the document to the 'gameStats' collection in Firestore
        await addDoc(collection(db, "gameStats"), {
            sessionId,
            gamertag,
            gameId,
            landingZone,
            kills,
            assists,
            damage,
            placement,
            timestamp: new Date()
        });

        // Success message
        alert("Nice Cock!");

        // Clear the form fields after submission
        document.getElementById('gameId').value = '';
        document.getElementById('landingZone').value = '';
        document.getElementById('kills').value = '';
        document.getElementById('assists').value = '';
        document.getElementById('damage').value = '';
        document.getElementById('placement').value = '';
        
    } catch (error) {
        console.error("Error adding document: ", error);
    }

});
