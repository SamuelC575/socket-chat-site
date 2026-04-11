const socket = io(); // connect to the server

const submitStatus = document.getElementById('submit');

submitStatus.addEventListener('click', function() {
    const feedBack = document.getElementById('feedback');
    const username = document.getElementById('username');

    // Prevent empty submission
    if (!feedBack.value.trim() || !username.value.trim()) {
        alert('Please enter both username and feedback');
        return;
    }

    // Emit data as an object
    const review = `${username.value}: ${feedback.value}`
    socket.emit('recommend', review);

    // Clear inputs
    feedBack.value = "";
    username.value = "";
});

