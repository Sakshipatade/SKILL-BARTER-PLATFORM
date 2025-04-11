window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!user) {
        alert('You must log in first');
        window.location.href = 'login.html';
        return;
    }

    // Set user data on profile
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileImage').src = user.profilePhoto 
        ? `http://localhost:5000/uploads/${user.profilePhoto}` 
        : 'profile-placeholder.png';

    fetchSkills(user.username);
    fetchSkillCount();

    // Listen for posted skill event
    window.addEventListener('skillPosted', () => {
        fetchSkills(user.username);
        fetchSkillCount();
    });
});

function fetchSkills(userName) {
    fetch('http://localhost:5000/api/skills')
        .then(res => res.json())
        .then(skills => {
            const container = document.getElementById('userSkills');
            container.innerHTML = '';

            skills
                .filter(skill => skill.yourName === userName)
                .forEach(skill => {
                    const card = document.createElement('div');
                    card.className = 'skill-card';
                    card.innerHTML = `
                        <h4>${skill.skillName}</h4>
                        <p>${skill.description}</p>
                        <button onclick="deleteSkill(${skill.id})">Delete</button>
                        <button onclick="editSkill(${skill.id}, '${skill.skillName}', '${skill.description}')">Edit</button>
                    `;
                    container.appendChild(card);
                });
        });
}

function fetchSkillCount() {
    fetch('http://localhost:5000/api/skill-count')
        .then(res => res.json())
        .then(data => {
            document.getElementById('skillCounter').textContent = `${data.count}`;
        });
}

function deleteSkill(id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        fetch(`http://localhost:5000/api/delete-skill/${id}`, {
            method: 'DELETE'
        }).then(res => {
            if (res.ok) {
                alert('Skill deleted!');
                const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
                fetchSkills(user.username);
                fetchSkillCount();
            } else {
                alert('Failed to delete skill');
            }
        });
    }
}

function editSkill(id, oldName, oldDescription) {
    const newName = prompt('Edit skill name:', oldName);
    const newDesc = prompt('Edit description:', oldDescription);

    if (newName && newDesc) {
        fetch(`http://localhost:5000/api/update-skill/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillName: newName, description: newDesc })
        }).then(res => {
            if (res.ok) {
                alert('Skill updated!');
                const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
                fetchSkills(user.username);
            } else {
                alert('Failed to update skill');
            }
        });
    }
}
