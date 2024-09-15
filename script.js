// ===============================================
//                  Firebase
//================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsCjjOr7KguFLTusyTKadPJ1c4WfOYZs4",
    authDomain: "fortnite-stat-tracker2.firebaseapp.com",
    projectId: "fortnite-stat-tracker2",
    storageBucket: "fortnite-stat-tracker2.appspot.com",
    messagingSenderId: "1027445489979",
    appId: "1:1027445489979:web:81ffac5422bf59c546f71e",
    measurementId: "G-6R3JGYZWFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================================
//                  Form Setup
//================================================
const statsForm = document.getElementById('statsForm');
const statsContainer = document.getElementById('statsContainer');
const afz1219Akpg = document.getElementById('afz1219-akpg');
const lisanAkpg = document.getElementById('lisan-akpg');

// ===============================================
//                  Form Submission
//================================================
statsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const gamertag = document.getElementById('gamertag').value;
    const gameId = document.getElementById('gameId').value;
    const landingZone = document.getElementById('landingZone').value;
    const kills = parseInt(document.getElementById('kills').value);
    const assists = parseInt(document.getElementById('assists').value);
    const damage = parseInt(document.getElementById('damage').value);
    const placement = parseInt(document.getElementById('placement').value);

    try {
        await addDoc(collection(db, "gameStats"), {
            gamertag,
            gameId,
            landingZone,
            kills,
            assists,
            damage,
            placement,
            timestamp: new Date()
        });

        // Refresh the stats display after submission
        loadAllGameStats();
        calculateAkpg();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

// ===============================================
//                 Load Stats from Firebase
//================================================
async function loadAllGameStats() {
    // Modify the query to order by the timestamp in descending order
    const statsQuery = query(collection(db, "gameStats"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(statsQuery);

    // Create a nested object to store game stats by gameId
    let gameStats = {};

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gameId = data.gameId;

        // Initialize gameId if it doesn't exist
        if (!gameStats[gameId]) {
            gameStats[gameId] = {};
        }

        // Initialize gamertag if it doesn't exist within the gameId
        if (!gameStats[gameId][data.gamertag]) {
            gameStats[gameId][data.gamertag] = {
                kills: 0,
                assists: 0,
                damage: 0,
                placement: 0,
                landingZone: '',
                timestamp: data.timestamp // Store the timestamp for each game
            };
        }

        // Now assign the values
        gameStats[gameId][data.gamertag].kills = data.kills;
        gameStats[gameId][data.gamertag].assists = data.assists;
        gameStats[gameId][data.gamertag].damage = data.damage;
        gameStats[gameId][data.gamertag].placement = data.placement;
        gameStats[gameId][data.gamertag].landingZone = data.landingZone;
        gameStats[gameId].totalKills = (gameStats[gameId].totalKills || 0) + data.kills;

        // Also store the latest timestamp for the game
        if (!gameStats[gameId].timestamp || gameStats[gameId].timestamp < data.timestamp) {
            gameStats[gameId].timestamp = data.timestamp;
        }
    });

    // Clear existing stats display
    statsContainer.innerHTML = '';

    // Generate and display tables for each gameId, most recent first
    for (const gameId in gameStats) {
        const gameData = gameStats[gameId];

        // Ensure Lisan-Al-Gaib exists before trying to access its properties
        const lisanData = gameData['Lisan-Al-Gaib'] || { landingZone: 'N/A', kills: 0, assists: 0, damage: 0, placement: 'N/A' };
        const afz1219Data = gameData['AFZ1219'] || { landingZone: 'N/A', kills: 0, assists: 0, damage: 0, placement: 'N/A' };

        // Format the timestamp into a readable date
        const formattedDate = gameData.timestamp ? gameData.timestamp.toDate().toLocaleDateString() : 'No Date';

        const gameTable = `
            <table>
                <caption>Game ID: ${gameId} - ${formattedDate}</caption>
                <tr><th>Gamertag</th><th>Landing Zone</th><th>Kills</th><th>Assists</th><th>Damage</th><th>Placement</th></tr>
                <tr><td>AFZ1219</td><td>${afz1219Data.landingZone}</td><td>${afz1219Data.kills}</td><td>${afz1219Data.assists}</td><td>${afz1219Data.damage}</td><td>${afz1219Data.placement}</td></tr>
                <tr><td>Lisan-Al-Gaib</td><td>${lisanData.landingZone}</td><td>${lisanData.kills}</td><td>${lisanData.assists}</td><td>${lisanData.damage}</td><td>${lisanData.placement}</td></tr>
                <tr><th colspan="2">Total Team Kills</th><th>${gameData.totalKills}</th></tr>
            </table>
        `;
        // Add each gameTable to the container, keeping the order
        statsContainer.innerHTML += gameTable;
    }
}


// ===============================================
//                 Calculate AKPG
//================================================
async function calculateAkpg() {
    const statsQuery = query(collection(db, "gameStats"));
    const querySnapshot = await getDocs(statsQuery);

    let afz1219TotalKills = 0, afz1219Games = 0, afz1219TotalDamage = 0;
    let lisanTotalKills = 0, lisanGames = 0, lisanTotalDamage = 0;
    let gameIds = new Set();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        gameIds.add(data.gameId);

        if (data.gamertag === "AFZ1219") {
            afz1219TotalKills += data.kills;
            afz1219TotalDamage += data.damage; // Add up damage
            afz1219Games++;
        } else if (data.gamertag === "Lisan-Al-Gaib") {
            lisanTotalKills += data.kills;
            lisanTotalDamage += data.damage; // Add up damage
            lisanGames++;
        }
    });

    // Calculate AKPG (Average Kills Per Game)
    const afz1219AkpgValue = afz1219Games > 0 ? (afz1219TotalKills / gameIds.size).toFixed(2) : 0;
    const lisanAkpgValue = lisanGames > 0 ? (lisanTotalKills / gameIds.size).toFixed(2) : 0;

    // Calculate ADPG (Average Damage Per Game)
    const afz1219AdpgValue = afz1219Games > 0 ? (afz1219TotalDamage / gameIds.size).toFixed(2) : 0;
    const lisanAdpgValue = lisanGames > 0 ? (lisanTotalDamage / gameIds.size).toFixed(2) : 0;

    // Update the DOM
    afz1219Akpg.textContent = `Kpg: ${afz1219AkpgValue}`;
    lisanAkpg.textContent = `Kpg: ${lisanAkpgValue}`;
    
    // Create new elements or update existing elements for ADPG
    // Assuming you have two elements with IDs 'afz1219-adpg' and 'lisan-adpg' in your HTML
    const afz1219Adpg = document.getElementById('afz1219-adpg');
    const lisanAdpg = document.getElementById('lisan-adpg');
    
    afz1219Adpg.textContent = `Dpg: ${afz1219AdpgValue}`;
    lisanAdpg.textContent = `Dpg: ${lisanAdpgValue}`;
}


document.addEventListener('DOMContentLoaded', () => {
    const tickerContent = document.querySelector('.ticker-content');

    // Clone the ticker content to create a seamless loop
    const clone = tickerContent.cloneNode(true);
    tickerContent.parentNode.appendChild(clone);
});




// Load all game stats and AKPG on page load
loadAllGameStats();
calculateAkpg();
