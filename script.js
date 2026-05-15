// Menu hamburger
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbar = document.getElementById('navbar');

hamburgerBtn.addEventListener('click', () => {
    // Bascule la classe "active" sur le parent nav
    navbar.classList.toggle('active');
});