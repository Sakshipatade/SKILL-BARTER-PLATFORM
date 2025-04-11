document.addEventListener('DOMContentLoaded', async () => {
    const skillsContainer = document.getElementById('skillsContainer');
    const searchBox = document.getElementById('searchBox');
    let allSkills = [];

    // Fetch skills from backend and store in allSkills
    async function fetchSkills() {
        try {
            const response = await fetch('http://localhost:5000/api/skills');
            allSkills = await response.json();
            renderSkills(allSkills);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    }

    // Display skills in the container
    function renderSkills(skills) {
        skillsContainer.innerHTML = '';

        if (skills.length === 0) {
            skillsContainer.innerHTML = '<p>No skills found.</p>';
            return;
        }

        skills.forEach(skill => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <h3>${skill.skillName}</h3>
                <p><strong>By:</strong> ${skill.yourName}</p>
                <p>${skill.description}</p>
            `;
            skillsContainer.appendChild(card);
        });
    }

    // Filter skills live as user types
    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();

        const filteredSkills = allSkills.filter(skill =>
            skill.skillName.toLowerCase().includes(searchTerm) ||
            skill.description.toLowerCase().includes(searchTerm) ||
            skill.yourName.toLowerCase().includes(searchTerm)
        );

        renderSkills(filteredSkills);
    });

    fetchSkills(); // Initial load
});
