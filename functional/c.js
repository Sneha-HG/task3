// import firebase & give access to realtime db
import { db } from './firebase-config.js';
import { ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
//variable declaration //
let players = [];
let editingId = null;
let currentGenderFilter = null;
let currentRoleFilter = null;
//function to display handedness only to batter & bowler//
function isHandednessRequired(role) {
    if (!role) return false;
    return role === 'batter' || role === 'bowler';
}
//function to calculate age with dob//
function calculateAgeFromDOB(dob) {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
// form validation//
function validatePlayerForm({ name, gender, dob, email, role, handedness }) {
    let valid = true;
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || !nameRegex.test(name)) { showError('name', 'Please fill your name'); valid = false; } else clearError('name');
    if (!gender) { showError('genderError', 'Please select gender'); valid = false; } else clearError('genderError');
    if (!dob) { showError('dob', 'Please enter your date of birth'); valid = false; } else clearError('dob');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { showError('emailinput', 'Please enter a valid email address'); valid = false; } else clearError('emailinput');
    if (!role) { showError('roleDropdown', 'Please select a role'); valid = false; } else clearError('roleDropdown');

    if (isHandednessRequired(role)) {
        if (!handedness) { showError('handednessDropdown', 'Please select handedness'); valid = false; } else clearError('handednessDropdown');
    } else {
        $('#handednessDropdown').val('');
        clearError('handednessDropdown');
    }

    return valid;
}
// function to show error when input field is empty//
function showError(id, message) {
    $(`#${id}`).addClass('invalid');
    $(`#${id}Error`).text(message);
}
// function to clear error as soon as empty field is filled //
function clearError(id) {
    $(`#${id}`).removeClass('invalid');
    $(`#${id}Error`).text('');
}
//main function to create or update user details of players//
function savePlayer() {
    const name = $('#name').val().trim();
    const gender = $('input[name="gender"]:checked').val();
    const dob = $('#dob').val();
    const email = $('#emailinput').val().trim();
    const role = $('#roleDropdown').val();
    let handedness = $('#handednessDropdown').val(); // values can be reassigned when using let //

    //calls validator if any field is empty returns no save//
    const isValid = validatePlayerForm({ name, gender, dob, email, role, handedness });
    if (!isValid) return;

    if (!isHandednessRequired(role)) handedness = 'N/A'; // role that does not require handedness
    //generates unique id for editing//
    const id = editingId || `player${players.length + 1}`;
    const player = { id, name, gender, dob, age: calculateAgeFromDOB(dob), email, role, handedness };
    //save to firebase//
    set(ref(db, `CricketPlayers/${id}`), player)
        .then(() => { // after successful save//
            $('#playerModal').modal('hide');
            $('#playerForm')[0].reset();
            editingId = null; // back to create modal again//
        })
        .catch(err => console.error("Save error:", err)); // if save does not happen//
}
//function to edit player using their id( unique)//
function editPlayer(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;
    editingId = id;
    $('#name').val(player.name);
    $(`input[name="gender"][value="${player.gender}"]`).prop('checked', true);
    $('#dob').val(player.dob);
    $('#emailinput').val(player.email);
    $('#roleDropdown').val(player.role);
    if (isHandednessRequired(player.role)) {
        $('#handednessGroup').show();
        $('#handednessDropdown').val(player.handedness);
    } else {
        $('#handednessGroup').hide();
        $('#handednessDropdown').val('');
    }
    //update modal //
    $('#formTitle').text('Edit Player');
    $('#saveBtn').text('Update');
    $('#playerModal').modal('show');
}
//function to delete player//
function deletePlayer(id) {
    if (confirm('Are you sure you want to delete this player?')) {
        remove(ref(db, `CricketPlayers/${id}`));
    }
}
//table rendering & filtering//
function refreshTable() {
    const tableBody = $('#playerTable');
    let filteredPlayers = [...players];//copy of players//
    //conditional filetring//
    if (currentGenderFilter === 'male') {
        filteredPlayers = filteredPlayers.filter(p => p.gender === 'male');
    } else if (currentGenderFilter === 'female') {
        filteredPlayers = filteredPlayers.filter(p => p.gender === 'female');
    }

    if (currentRoleFilter !== 'all' && currentRoleFilter !== '') {
        filteredPlayers = filteredPlayers.filter(p => p.role === currentRoleFilter);
    }

    if (filteredPlayers.length === 0) {
        tableBody.html('<tr><td colspan="8" class="text-center">No players found</td></tr>');
        return;
    }
    //using map function transforms player into html row //
    const rows = filteredPlayers.map((player, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.gender}</td>
      <td>${player.age}</td>
      <td>${player.role}</td>
      <td>${player.handedness || 'N/A'}</td>
      <td>${player.email}</td>
      <td>
        <button class="btn btn-warning btn-xs" onclick="editPlayer('${player.id}')">Edit</button>
        <button class="btn btn-danger btn-xs" onclick="deletePlayer('${player.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
    // injects rows into dom//
    tableBody.html(rows);
}
//function to switch tabs based on user selection//
function switchTab(type, value) {
    if (type === 'gender') {
        currentGenderFilter = value === 0 ? 'male' : 'female';//ternary operator //
        $('.gender-tab').removeClass('active');
        $(`.gender-tab:eq(${value})`).addClass('active');// adds active class to selected gender//
        $('#roleTabsContainer').show();
    } else if (type === 'role') {
        currentRoleFilter = value;
        $('.role-tab').removeClass('active');
        $(`.role-tab:contains(${value})`).addClass('active');
    }
    refreshTable();
}
//firebase listener to load players from firebase 
function loadPlayers() {
    onValue(ref(db, 'CricketPlayers/'), snapshot => {
        const data = snapshot.val();
        players = data ? Object.values(data) : [];
        refreshTable();
    });
}
//DOM initialization
$(document).ready(function () {
    loadPlayers();
    //resets modal on close//
    $('#playerModal').on('hidden.bs.modal', function () {
        $('#playerForm')[0].reset();
        editingId = null;
        $('#formTitle').text('Register Yourself!');
        $('#saveBtn').text('Save');
        $('.form-control').removeClass('invalid');
        $('.error-text').text('');
        $('input[name="gender"]').prop('checked', false);
        $('#handednessGroup').hide();
    });
    //real time input validation//
    $('#name, #dob, #emailinput').on('input', function () {
        if ($(this).val().trim() !== '') {
            clearError(this.id);
        }
    });
    //role  and handedness dropdown  validation//
    $('#roleDropdown, #handednessDropdown').on('change', function () {
        if ($(this).val() !== '') {
            clearError(this.id);
        }
    });
    //when user selets a role//
    $('#roleDropdown').on('change', function () {
        const selectedRole = $(this).val();
        if (isHandednessRequired(selectedRole)) {
            $('#handednessGroup').show();
        } else {
            $('#handednessGroup').hide();
            $('#handednessDropdown').val('');
            clearError('handednessDropdown');
        }
    });
    //gender selection validation//
    $('input[name="gender"]').on('change', function () {
        clearError('genderError');
    });
});
//window exports to make function globally accessible//
window.savePlayer = savePlayer;
window.editPlayer = editPlayer;
window.deletePlayer = deletePlayer;
window.switchTab = switchTab;
