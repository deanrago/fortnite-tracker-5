// ===============================================
//                 Firebase and Session List for Session Page
//================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

async function loadAllGameStats() {
    const statsQuery = query(collection(db, "gameStats"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(statsQuery);

    // Group stats by gameId
    let groupedGameStats = {};
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gameId = data.gameId;

        if (!groupedGameStats[gameId]) {
            groupedGameStats[gameId] = [];
        }

        groupedGameStats[gameId].push({
            gamertag: data.gamertag,
            kills: data.kills,
            assists: data.assists,
            damage: data.damage,
            placement: data.placement
        });
    });

    let statsContainer = document.getElementById('statsContainer');
    statsContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Gamertag</th>
                    <th>Kills</th>
                    <th>Assists</th>
                    <th>Damage</th>
                    <th>Placement</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    let tableBody = statsContainer.querySelector('tbody');
    let alternateClass = "game-group-1"; // Initialize for alternating rows

    // Now process each gameId and add rows
    for (let gameId in groupedGameStats) {
        const players = groupedGameStats[gameId];

        // Toggle the class for each gameId group for alternating styles
        alternateClass = (alternateClass === "game-group-1") ? "game-group-2" : "game-group-1";

        // Check if all placements are the same
        const allPlacementsSame = players.every(player => player.placement === players[0].placement);

        // Add the first row with `gameId` and the first player's stats
        let row = `
            <tr class="${alternateClass}">
                <td rowspan="${players.length}">${gameId}</td>
                <td>${players[0].gamertag}</td>
                <td>${players[0].kills}</td>
                <td>${players[0].assists}</td>
                <td>${players[0].damage}</td>
        `;

        if (allPlacementsSame) {
            // If all placements are the same, use rowspan for placement
            row += `<td rowspan="${players.length}">${players[0].placement}</td></tr>`;
        } else {
            // If placements differ, show the individual placement for the first player
            row += `<td>${players[0].placement}</td></tr>`;
        }

        tableBody.innerHTML += row;

        // Add remaining rows for other players (without the `gameId` and placement if all are the same)
        for (let i = 1; i < players.length; i++) {
            let playerRow = `
                <tr class="${alternateClass}">
                    <td>${players[i].gamertag}</td>
                    <td>${players[i].kills}</td>
                    <td>${players[i].assists}</td>
                    <td>${players[i].damage}</td>
            `;

            if (!allPlacementsSame) {
                // If placements differ, show the individual placement for each player
                playerRow += `<td>${players[i].placement}</td>`;
            }

            playerRow += `</tr>`;
            tableBody.innerHTML += playerRow;
        }
    }
}

document.addEventListener('DOMContentLoaded', loadAllGameStats);
