// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================================
//                 Fetch and Display Data
//================================================
async function loadPerformanceData() {
    try {
        const statsQuery = collection(db, "gameStats");
        const querySnapshot = await getDocs(statsQuery);

        console.log("Fetched Data:", querySnapshot);

        if (querySnapshot.empty) {
            console.log("No documents found in 'gameStats'");
            return;
        }

        // Prepare player data
        let playersData = [];
        querySnapshot.forEach((doc) => {
            playersData.push(doc.data());
        });

        // Log individual player data for inspection
        playersData.forEach((playerData, index) => {
            console.log(`Player ${index + 1} Data:`, playerData);
        });

        // Calculate stats
        const kpgStats = await calculateKPG(playersData);
        const dpgStats = await calculateDPG(playersData);
        const maxDamageStats = await calculateMaxDamage(playersData);
        const maxKillsStats = await calculateMaxKills(playersData);

        console.log("KPG Stats:", kpgStats);
        console.log("DPG Stats:", dpgStats);
        console.log("Max Damage Stats:", maxDamageStats);
        console.log("Max Kills Stats:", maxKillsStats);

        // Render Stats (only for valid data)
        document.getElementById('afz1219-akpg').textContent = `${kpgStats['AFZ1219'] || 'N/A'}`;
        document.getElementById('afz1219-adpg').textContent = `${dpgStats['AFZ1219'] || 'N/A'}`;
        document.getElementById('afz1219-max-damage').textContent = `${maxDamageStats['AFZ1219'] || 'N/A'}`;
        document.getElementById('afz1219-max-kills').textContent = `${maxKillsStats['AFZ1219'] || 'N/A'}`; 

        document.getElementById('lisan-akpg').textContent = `${kpgStats['Lisan-Al-Gaib'] || 'N/A'}`;
        document.getElementById('lisan-adpg').textContent = `${dpgStats['Lisan-Al-Gaib'] || 'N/A'}`;
        document.getElementById('lisan-max-damage').textContent = `${maxDamageStats['Lisan-Al-Gaib'] || 'N/A'}`;
        document.getElementById('lisan-max-kills').textContent = `${maxKillsStats['Lisan-Al-Gaib'] || 'N/A'}`;

        document.getElementById('jell-akpg').textContent = `${kpgStats['JeLL-o-Licious'] || 'N/A'}`;
        document.getElementById('jell-adpg').textContent = `${dpgStats['JeLL-o-Licious'] || 'N/A'}`;
        document.getElementById('jell-max-damage').textContent = `${maxDamageStats['JeLL-o-Licious'] || 'N/A'}`;
        document.getElementById('jell-max-kills').textContent = `${maxKillsStats['JeLL-o-Licious'] || 'N/A'}`;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// ===============================================
//                 Kills Per Game (KPG) Calculation
//================================================
async function calculateKPG(playersData) {
    let kpgStats = {};
    let gameCounts = {};

    playersData.forEach((playerData) => {
        const { kills, gamertag, gameId } = playerData;

        // Only process if gameId and kills are valid numbers
        if (gameId && typeof kills === 'number') {
            if (!kpgStats[gamertag]) {
                kpgStats[gamertag] = 0;
                gameCounts[gamertag] = 0;
            }

            kpgStats[gamertag] += kills;
            gameCounts[gamertag] += 1; // Count the game
        }
    });

    // Divide total kills by the number of games played and format to 1 decimal place
    Object.keys(kpgStats).forEach((gamertag) => {
        kpgStats[gamertag] = (kpgStats[gamertag] / gameCounts[gamertag]).toFixed(1);
    });

    return kpgStats;
}

// ===============================================
//                 Max Kills Calculation (New)
//================================================
async function calculateMaxKills(playersData) {
    let maxKillsStats = {};
    
    playersData.forEach((playerData) => {
        const { kills, gamertag } = playerData;

        if (typeof kills === 'number') {
            if (!maxKillsStats[gamertag]) {
                maxKillsStats[gamertag] = kills; // Initialize with the first kill value
            } else {
                maxKillsStats[gamertag] = Math.max(maxKillsStats[gamertag], kills); // Update if current kill is higher
            }
        }
    });

    return maxKillsStats;
}

// ===============================================
//                 Damage Per Game (DPG) Calculation
//================================================
async function calculateDPG(playersData) {
    let dpgStats = {};
    let gameCounts = {};

    playersData.forEach((playerData) => {
        const { damage, gamertag, gameId } = playerData;

        // Only process if gameId and damage are valid numbers
        if (gameId && typeof damage === 'number') {
            if (!dpgStats[gamertag]) {
                dpgStats[gamertag] = 0;
                gameCounts[gamertag] = 0;
            }

            dpgStats[gamertag] += damage;
            gameCounts[gamertag] += 1; // Count the game
        }
    });

    // Divide total damage by the number of games played and round down to nearest whole number
    Object.keys(dpgStats).forEach((gamertag) => {
        dpgStats[gamertag] = Math.floor(dpgStats[gamertag] / gameCounts[gamertag]);
    });

    return dpgStats;
}

// ===============================================
//                 Max Damage Calculation
//================================================
async function calculateMaxDamage(playersData) {
    let maxDamageStats = {};

    playersData.forEach((playerData) => {
        const { damage, gamertag } = playerData;

        // Only process if damage is a valid number
        if (typeof damage === 'number') {
            if (!maxDamageStats[gamertag]) {
                maxDamageStats[gamertag] = 0;
            }

            // Track max damage
            if (damage > maxDamageStats[gamertag]) {
                maxDamageStats[gamertag] = damage;
            }
        }
    });

    return maxDamageStats;
}

// Load Data when Page is Ready
document.addEventListener('DOMContentLoaded', loadPerformanceData);
