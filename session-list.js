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

    // Group stats by sessionId -> gameId
    let groupedSessionStats = {};
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const sessionId = data.sessionId || "N/A"; // Default to "N/A" if no session ID
        const gameId = data.gameId;

        if (!groupedSessionStats[sessionId]) {
            groupedSessionStats[sessionId] = {};
        }

        if (!groupedSessionStats[sessionId][gameId]) {
            groupedSessionStats[sessionId][gameId] = [];
        }

        groupedSessionStats[sessionId][gameId].push({
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
                    <th>ID</th>
                    <th>Gamertag</th>
                    <th>Avg Kills</th>
                    <th>Avg Assists</th>
                    <th>Avg Damage</th>
                    <th>Avg Placement</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    let tableBody = statsContainer.querySelector('tbody');
    let alternateClass = "game-group-1"; // Initialize for alternating rows

    // Now process each sessionId and gameId
    for (let sessionId in groupedSessionStats) {
        const sessionGames = groupedSessionStats[sessionId];

        // Calculate session-level average stats
        let totalKills = 0;
        let totalAssists = 0;
        let totalDamage = 0;
        let totalPlacement = 0;
        let gameCount = 0;
        let playerCount = 0;
        let uniqueGamertags = new Set();

        for (let gameId in sessionGames) {
            sessionGames[gameId].forEach((player) => {
                totalKills += player.kills;
                totalAssists += player.assists;
                totalDamage += player.damage;
                totalPlacement += player.placement;
                playerCount++;
                uniqueGamertags.add(player.gamertag);
            });
            gameCount++;
        }

        const avgKills = (totalKills / gameCount).toFixed(1); // 1 decimal place
        const avgAssists = (totalAssists / gameCount).toFixed(1); // 1 decimal place
        const avgDamage = Math.round(totalDamage / gameCount); // No decimal places
        const avgPlacement = Math.round(totalPlacement / playerCount); // No decimal places
        const allGamertags = Array.from(uniqueGamertags).join(', ');

        // Add session-level row (session ID in the "ID" column, rest are stats)
        let sessionRow = `
            <tr class="session-summary ${alternateClass}" data-session-id="${sessionId}" style="font-weight:bold; cursor:pointer;">
                <td colspan="1">${sessionId} <span class="toggle-icon">+</span></td>
                <td>${allGamertags}</td>
                <td>${avgKills}</td>
                <td>${avgAssists}</td>
                <td>${avgDamage}</td>
                <td>${avgPlacement}</td>
            </tr>
        `;
        tableBody.innerHTML += sessionRow;

        // Now process each gameId within this session
        for (let gameId in sessionGames) {
            const players = sessionGames[gameId];

            // Toggle the class for each gameId group for alternating styles
            alternateClass = (alternateClass === "game-group-1") ? "game-group-2" : "game-group-1";

            // Add the first row with `gameId` and the first player's stats
            let row = `
                <tr class="session-${sessionId} game-group ${alternateClass} hidden">
                    <td rowspan="${players.length}">${gameId}</td>
                    <td>${players[0].gamertag}</td>
                    <td>${players[0].kills}</td>
                    <td>${players[0].assists}</td>
                    <td>${players[0].damage}</td>
                    <td>${players[0].placement}</td>
                </tr>
            `;
            tableBody.innerHTML += row;

            // Add remaining rows for other players
            for (let i = 1; i < players.length; i++) {
                let playerRow = `
                    <tr class="session-${sessionId} game-group ${alternateClass} hidden">
                        <td>${players[i].gamertag}</td>
                        <td>${players[i].kills}</td>
                        <td>${players[i].assists}</td>
                        <td>${players[i].damage}</td>
                        <td>${players[i].placement}</td>
                    </tr>
                `;
                tableBody.innerHTML += playerRow;
            }
        }
    }

    // Add event listener for collapsing/expanding sessions
    document.querySelectorAll('.session-summary').forEach((sessionRow) => {
        sessionRow.addEventListener('click', () => {
            const sessionId = sessionRow.getAttribute('data-session-id');
            document.querySelectorAll(`.session-${sessionId}`).forEach((gameRow) => {
                gameRow.classList.toggle('hidden');
            });
            const toggleIcon = sessionRow.querySelector('.toggle-icon');
            toggleIcon.textContent = toggleIcon.textContent === '+' ? '-' : '+';
        });
    });
}

// Add some CSS to hide and show game rows
const css = `
.hidden {
    display: none;
}
`;

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', loadAllGameStats);
