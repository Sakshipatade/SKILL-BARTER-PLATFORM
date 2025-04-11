document.getElementById('postSkillForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const skillName = document.getElementById('skillName').value.trim();
    const yourName = document.getElementById('yourName').value.trim();
    const description = document.getElementById('description').value.trim();
    const feedback = document.getElementById('formFeedback');

    if (!skillName || !yourName || !description) {
        feedback.style.display = 'block';
    } else {
        feedback.style.display = 'none';

        const skill = { skillName, yourName, description };

        try {
            const response = await fetch('http://localhost:5000/api/post-skill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skill)
            });

            if (response.ok) {
                const data = await response.json();
                alert('Skill posted successfully!');

                // ✅ Custom event dispatched
                window.dispatchEvent(new Event('skillPosted'));

                this.reset();
                window.location.href = 'find-skills.html';
            } else {
                alert('Error posting skill.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error. Please try again.');
        }
    }
});
