// Menu hamburger
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbar = document.getElementById('navbar');

hamburgerBtn.addEventListener('click', () => {
    // Bascule la classe "active" sur le parent nav
    navbar.classList.toggle('active');
});

//Audio Podcast
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('audio[id^="audio"]').forEach(audio => {
        const num = audio.id.replace('audio', '');
        const progressBar = document.getElementById('progressBar' + num);
        const currentTimeEl = document.getElementById('currentTime' + num);
        const durationEl = document.getElementById('duration' + num);
        const volumeSlider = document.getElementById('volumeSlider' + num);
        initProgressBar(audio.id);

        // Durée
        const setDuration = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                durationEl.textContent = formatTime(audio.duration);
            }
        };
        audio.addEventListener('loadedmetadata', setDuration);
        audio.addEventListener('durationchange', setDuration);
        if (audio.readyState >= 1) setDuration();

        // Progression
        audio.addEventListener('timeupdate', () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            progressBar.style.width = pct + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        // Fin
        audio.addEventListener('ended', () => {
            document.getElementById('playBtn' + num).querySelector('.play-icon').style.display = 'block';
            document.getElementById('playBtn' + num).querySelector('.pause-icon').style.display = 'none';
            progressBar.style.width = '0%';
            currentTimeEl.textContent = '0:00';
        });

        // Volume slider — attaché ici directement
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                audio.volume = parseFloat(volumeSlider.value);
                audio.muted = false;
            });
        }
    });
});

function togglePlay(audioId) {
    const audio = document.getElementById(audioId);
    const num = audioId.replace('audio', '');
    const playIcon = document.getElementById('playBtn' + num).querySelector('.play-icon');
    const pauseIcon = document.getElementById('playBtn' + num).querySelector('.pause-icon');

    if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

function initProgressBar(audioId) {
    const num = audioId.replace('audio', '');
    const bar = document.getElementById('progressContainer' + num);
    const audio = document.getElementById(audioId);
    let isDragging = false;

    function seek(e) {
        const rect = bar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (audio.duration) audio.currentTime = pct * audio.duration;
    }

    // Souris
    bar.addEventListener('mousedown', (e) => { isDragging = true; seek(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) seek(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // Tactile
    bar.addEventListener('touchstart', (e) => { isDragging = true; seek(e); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (isDragging) seek(e); }, { passive: true });
    document.addEventListener('touchend', () => { isDragging = false; });
}

function toggleMute(audioId) {
    const audio = document.getElementById(audioId);
    const num = audioId.replace('audio', '');
    const slider = document.getElementById('volumeSlider' + num);
    const btn = document.getElementById('volumeBtn' + num);

    audio.muted = !audio.muted;
    if (slider) slider.value = audio.muted ? 0 : audio.volume;
    btn.querySelector('.vol-on').style.display  = audio.muted ? 'none'  : 'block';
    btn.querySelector('.vol-off').style.display = audio.muted ? 'block' : 'none';
}

function downloadAudio(audioId) {
    const audio = document.getElementById(audioId);
    const a = document.createElement('a');
    a.href = audio.src;
    a.download = audio.src.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function formatTime(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Pagination
const ARTICLES_PAR_PAGE = 6;
const articles = document.querySelectorAll('#articles-container .article-card');
const pagination = document.getElementById('pagination');
let pageCourante = 1;

function afficherPage(page) {
    const debut = (page - 1) * ARTICLES_PAR_PAGE;
    const fin = debut + ARTICLES_PAR_PAGE;

    articles.forEach((article, index) => {
        article.style.display = (index >= debut && index < fin) ? '' : 'none';
    });

    pageCourante = page;
    genererPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function creerFleche(direction) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '10');
    svg.setAttribute('height', '17');
    svg.setAttribute('viewBox', '0 0 10 17');
    svg.setAttribute('fill', 'none');
    svg.style.cursor = 'pointer';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', direction === 'gauche'
        ? 'M8.0437 15.0875L0.999951 8.04375L8.0437 1'
        : 'M1 15.0875L8.04375 8.04375L1 1'
    );
    path.setAttribute('stroke', '#00508F');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(path);
    return svg;
}

function genererPagination() {
    const totalPages = Math.ceil(articles.length / ARTICLES_PAR_PAGE);
    pagination.innerHTML = '';

    // Flèche gauche
    const flecheGauche = creerFleche('gauche');
    flecheGauche.style.opacity = pageCourante > 1 ? '1' : '0.3';
    flecheGauche.style.cursor = pageCourante > 1 ? 'pointer' : 'default';
    if (pageCourante > 1) {
        flecheGauche.addEventListener('click', () => afficherPage(pageCourante - 1));
    }
    pagination.appendChild(flecheGauche);

    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'pagination-link' + (i === pageCourante ? ' pagination-active' : '');
        a.textContent = i;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            afficherPage(i);
        });
        pagination.appendChild(a);
    }

    // Flèche droite
    const flecheDroite = creerFleche('droite');
    flecheDroite.style.opacity = pageCourante < totalPages ? '1' : '0.3';
    flecheDroite.style.cursor = pageCourante < totalPages ? 'pointer' : 'default';
    if (pageCourante < totalPages) {
        flecheDroite.addEventListener('click', () => afficherPage(pageCourante + 1));
    }
    pagination.appendChild(flecheDroite);
}

// Initialisation
afficherPage(1);