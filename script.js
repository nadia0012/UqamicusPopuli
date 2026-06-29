// Menu hamburger
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbar = document.getElementById('navbar');

hamburgerBtn.addEventListener('click', () => {
    // Bascule la classe "active" sur le parent nav
    navbar.classList.toggle('active');
});

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY <= 0) {
        // Tout en haut → toujours visible
        document.getElementById('main-header').classList.remove('header-hidden');
    } else if (currentScrollY < lastScrollY) {
        // Scroll vers le haut → on montre
        document.getElementById('main-header').classList.remove('header-hidden');
    } else {
        // Scroll vers le bas → on cache
        document.getElementById('main-header').classList.add('header-hidden');
    }

    lastScrollY = currentScrollY;
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animation une seule fois
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));

window.addEventListener('scroll', () => {
    const scrollIcon = document.querySelector('.scroll-indicator');
    if (window.scrollY > 50) {
        scrollIcon.style.opacity = '0';
    } else {
        scrollIcon.style.opacity = '1';
    }
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

// =============================================
// FORMULAIRE — soumission Web3Forms + overlay
// =============================================
(function () {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    const overlay = document.getElementById('formSuccessOverlay');
    const wrapper = document.querySelector('.submit-wrapper');
    const btn = contactForm.querySelector('button');
    const requiredFields = contactForm.querySelectorAll('[required]');
    const emailField = document.getElementById('email');
    const uploadedArea = document.querySelector('.uploaded-area'); // Ajouté pour la cohérence
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let selectedFiles = []; // IMPORTANT : Doit être défini ici pour être utilisé plus bas
    const btnOriginalHTML = btn.innerHTML;

    // --- 1. VALIDATION ---
    function checkValidity() {
        const allValid = Array.from(requiredFields).every(field => {
            if (field.type === 'file') return true;
            const config = fieldConfig[field.id];
            if (!config) return field.value.trim() !== '';
            return config.validate(field.value.trim());
        });

        if (allValid) {
            btn.classList.remove('disabled');
            btn.style.pointerEvents = 'auto';
            wrapper.classList.remove('form-invalid');
        } else {
            btn.classList.add('disabled');
            // On laisse pointer-events à auto pour le curseur "interdit" demandé précédemment
            btn.style.pointerEvents = 'auto'; 
            wrapper.classList.add('form-invalid');
        }
    }

    // --- 2. CONFIGURATION DES CHAMPS ---
    const fieldConfig = {
        'full-name': {
            empty: 'Veuillez entrer votre nom complet.',
            invalid: 'Le nom doit contenir au moins 2 caractères sans chiffres.',
            validate: val => val.length >= 2 && !/\d/.test(val)
        },
        'email': {
            empty: 'Veuillez entrer votre adresse courriel.',
            invalid: 'Format de courriel invalide (ex: nom@domaine.com).',
            validate: val => emailRegex.test(val)
        },
        'subject': {
            empty: 'Veuillez entrer un sujet.',
            invalid: 'Le sujet doit contenir au moins 5 caractères.',
            validate: val => val.length >= 5
        },
        'message': {
            empty: 'Veuillez écrire votre message.',
            invalid: 'Le message doit contenir au moins 20 caractères.',
            validate: val => val.length >= 20
        },
    };

    // --- 3. GESTION DES ERREURS VISUELLES ---
    const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r=".8" fill="currentColor"/></svg>`;

    function showFieldError(field, msg ) {
        field.classList.add('error-state');
        let errEl = field.parentElement.querySelector('.field-error');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.className = 'field-error';
            field.parentElement.appendChild(errEl);
        }
        errEl.innerHTML = `${errorIcon} ${msg}`;
    }

    function clearFieldError(field) {
        field.classList.remove('error-state');
        const errEl = field.parentElement.querySelector('.field-error');
        if (errEl) errEl.remove();
    }

    // --- 4. LISTENERS ---
    Object.keys(fieldConfig).forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;

        field.addEventListener('input', () => {
            const config = fieldConfig[field.id];
            if (field.value.trim() !== '' && !config.validate(field.value.trim())) {
                showFieldError(field, config.invalid);
            } else {
                clearFieldError(field);
            }
            checkValidity();
        });

        field.addEventListener('blur', () => {
            const config = fieldConfig[field.id];
            if (field.value.trim() === '') {
                showFieldError(field, config.empty);
            } else if (!config.validate(field.value.trim())) {
                showFieldError(field, config.invalid);
            }
            checkValidity();
        });
    });

    // --- 5. GESTION DES FICHIERS ---
    // Cette fonction doit être accessible globalement si appelée par onchange="" dans le HTML
    window.updateFileLabel = function(input) {
        const fileChosen = document.getElementById('file-chosen');
        selectedFiles = Array.from(input.files); // On stocke les fichiers
        
        if (selectedFiles.length > 0) {
            fileChosen.textContent = selectedFiles.length === 1 
                ? selectedFiles[0].name 
                : selectedFiles.length + " fichiers sélectionnés";
        } else {
            fileChosen.textContent = "Aucun fichier choisi";
        }
        checkValidity();
    };

    // --- 6. SOUMISSION ---
    wrapper.addEventListener('click', async function (e) {
        if (btn.classList.contains('disabled')) {
            e.preventDefault();
            return;
        }
        
        // Si c'est un bouton submit dans un form, le click sur le wrapper peut doubler l'envoi
        // Assurez-vous que l'événement vient bien d'une intention de soumission
    });

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (btn.classList.contains('disabled')) return;

        btn.classList.add('disabled');
        btn.innerHTML = 'Envoi en cours...';

        try {
            const formData = new FormData(contactForm);
            
            // Logique Cloudinary (si vous avez la fonction uploadToCloudinary définie ailleurs)
            if (selectedFiles.length > 0 && typeof uploadToCloudinary === 'function') {
                const urls = await Promise.all(selectedFiles.map(file => uploadToCloudinary(file)));
                const fileLinks = '\n\n📎 Fichiers joints :\n' + urls.map((url, i) => `${i + 1}. ${selectedFiles[i].name} : ${url}`).join('\n');
                formData.set('message', formData.get('message') + fileLinks);
                formData.delete('attachment');
            }

            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                if (overlay) overlay.classList.add('visible');
                contactForm.reset();
                selectedFiles = [];
                if (document.getElementById('file-chosen')) {
                    document.getElementById('file-chosen').textContent = "Aucun fichier choisi";
                }
                setTimeout(() => overlay.classList.remove('visible'), 3000);
            } else {
                alert('Erreur lors de l\'envoi.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            btn.innerHTML = btnOriginalHTML;
            checkValidity();
        }
    });

    checkValidity();
})();
