// =============================================
// FICHIERS + FORMULAIRE
// =============================================
document.addEventListener('DOMContentLoaded', () => {

    let selectedFiles = [];
    const fileInput = document.getElementById('attachment');
    const uploadedArea = document.querySelector('.uploaded-area');

    const fileSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 44 59" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M25.6667 0H5.5C4.04131 0 2.64236 0.579462 1.61091 1.61091C0.579462 2.64236 0 4.04131 0 5.5V53.1667C0 54.6254 0.579462 56.0243 1.61091 57.0558C2.64236 58.0872 4.04131 58.6667 5.5 58.6667H38.5C39.9587 58.6667 41.3576 58.0872 42.3891 57.0558C43.4205 56.0243 44 54.6254 44 53.1667V18.3333H43.9853L25.6667 0ZM22 5.88133V21.0833C22 21.5893 22.4107 22 22.9167 22H38.1223C38.3036 21.9996 38.4806 21.9455 38.6311 21.8445C38.7816 21.7435 38.8987 21.6002 38.9678 21.4327C39.0369 21.2651 39.0547 21.0808 39.0191 20.9032C38.9835 20.7255 38.896 20.5623 38.7677 20.4343L23.5657 5.23233C23.4375 5.1038 23.274 5.01624 23.096 4.98073C22.9179 4.94522 22.7334 4.96338 22.5657 5.0329C22.3979 5.10241 22.2547 5.22016 22.154 5.3712C22.0533 5.52225 21.9997 5.6998 22 5.88133Z" fill="#00508F"/>
    </svg>`;

    const deleteSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="cursor:pointer; flex-shrink:0;">
        <path d="M18 6L6 18M6 6l12 12" stroke="#00508F" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const newFiles = Array.from(this.files);
            newFiles.forEach(newFile => {
                const alreadyExists = selectedFiles.some(f => f.name === newFile.name && f.size === newFile.size);
                if (!alreadyExists) selectedFiles.push(newFile);
            });
            renderFiles();
        });
    }

    function renderFiles() {
        uploadedArea.innerHTML = '';
        const dt = new DataTransfer();
        selectedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;

        selectedFiles.forEach((file, index) => {
            let fileName = file.name;
            if (fileName.length >= 20) {
                const splitName = fileName.split('.');
                fileName = splitName[0].substring(0, 13) + '... .' + splitName[splitName.length - 1];
            }
            const fileSize = file.size < 1024 * 1024
                ? Math.floor(file.size / 1024) + ' KB'
                : (file.size / (1024 * 1024)).toFixed(2) + ' MB';

            const li = document.createElement('li');
            li.classList.add('row');
            li.innerHTML = `
                <div class="content">
                    ${fileSVG}
                    <div class="details">
                        <span class="name">${fileName}</span>
                        <span class="size">${fileSize}</span>
                    </div>
                </div>
                ${deleteSVG}
            `;
            li.querySelector('svg:last-child').addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                renderFiles();
            });
            uploadedArea.appendChild(li);
        });
    }

    // =============================================
    // CLOUDINARY
    // =============================================
    async function uploadToCloudinary(file) {
        const cloudName = 'dckex6rbv';
        const uploadPreset = 'uqamicus_uploads';

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: data,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const result = await response.json();
        return result.secure_url;
    }

    // =============================================
    // FORMULAIRE
    // =============================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const overlay = document.getElementById('formSuccessOverlay');
        const wrapper = document.querySelector('.submit-wrapper');
        const btn = contactForm.querySelector('button');
        const requiredFields = contactForm.querySelectorAll('[required]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const btnOriginalHTML = btn.innerHTML;

        const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M8 4.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="11" r=".8" fill="currentColor"/>
        </svg>`;

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
                btn.style.pointerEvents = 'none';
                wrapper.classList.add('form-invalid');
            }
        }

        function showFieldError(field, msg) {
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

        function validateField(field) {
            const config = fieldConfig[field.id];
            if (!config) return;
            const val = field.value.trim();
            if (config.validate(val)) {
                clearFieldError(field);
            }
        }

        function validateFieldOnBlur(field) {
            const config = fieldConfig[field.id];
            if (!config) return;
            const val = field.value.trim();
            if (val === '') {
                showFieldError(field, config.empty);
            } else if (!config.validate(val)) {
                showFieldError(field, config.invalid);
            } else {
                clearFieldError(field);
            }
        }

        Object.keys(fieldConfig).forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;
            field.addEventListener('input', () => { validateField(field); checkValidity(); });
            field.addEventListener('blur', () => { validateFieldOnBlur(field); checkValidity(); });
        });

        wrapper.addEventListener('click', async function (e) {
            e.preventDefault();
            if (btn.classList.contains('disabled')) return;

            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none';
            btn.innerHTML = 'Envoi en cours...';

            try {
                let fileLinks = '';
                if (selectedFiles.length > 0) {
                    const urls = await Promise.all(selectedFiles.map(file => uploadToCloudinary(file)));
                    fileLinks = '\n\n📎 Fichiers joints :\n' + urls.map((url, i) => `${i + 1}. ${selectedFiles[i].name} : ${url}`).join('\n');
                }

                const form = document.querySelector('.email-section');
                const formData = new FormData(form);
                formData.delete('attachment');
                formData.set('message', formData.get('message') + fileLinks);

                const response = await fetch(form.action, { method: 'POST', body: formData });

                if (response.ok) {
                    if (overlay) overlay.classList.add('visible');
                    contactForm.querySelectorAll('input, textarea').forEach(input => {
                        input.value = '';
                        if (input.type === 'file') input.value = null;
                    });
                    selectedFiles = [];
                    if (uploadedArea) uploadedArea.innerHTML = '';
                    setTimeout(() => { if (overlay) overlay.classList.remove('visible'); }, 3000);
                } else {
                    alert('Erreur lors de l\'envoi.');
                }
            } catch (error) {
                alert('Erreur: ' + error.message);
            } finally {
                btn.innerHTML = btnOriginalHTML;
                checkValidity();
            }
        });

        checkValidity();
    }

    // =============================================
    // PAGINATION
    // =============================================
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

        const flecheGauche = creerFleche('gauche');
        flecheGauche.style.opacity = pageCourante > 1 ? '1' : '0.3';
        flecheGauche.style.cursor = pageCourante > 1 ? 'pointer' : 'default';
        if (pageCourante > 1) {
            flecheGauche.addEventListener('click', () => afficherPage(pageCourante - 1));
        }
        pagination.appendChild(flecheGauche);

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

        const flecheDroite = creerFleche('droite');
        flecheDroite.style.opacity = pageCourante < totalPages ? '1' : '0.3';
        flecheDroite.style.cursor = pageCourante < totalPages ? 'pointer' : 'default';
        if (pageCourante < totalPages) {
            flecheDroite.addEventListener('click', () => afficherPage(pageCourante + 1));
        }
        pagination.appendChild(flecheDroite);
    }

    if (pagination) afficherPage(1);

}); // ← fin DOMContentLoaded


// =============================================
// MENU HAMBURGER
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbar = document.getElementById('navbar');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // Scroll indicator
    const scrollIcon = document.querySelector('.scroll-indicator');
    if (scrollIcon) {
        window.addEventListener('scroll', () => {
            scrollIcon.style.opacity = window.scrollY > 50 ? '0' : '1';
        });
    }
});


// =============================================
// HEADER HIDE/SHOW ON SCROLL
// =============================================
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const header = document.getElementById('main-header');
    if (!header) return;

    if (currentScrollY <= 0) {
        header.classList.remove('header-hidden');
    } else if (currentScrollY < lastScrollY) {
        header.classList.remove('header-hidden');
    } else {
        header.classList.add('header-hidden');
    }
    lastScrollY = currentScrollY;
});


// =============================================
// SCROLL ANIMATIONS
// =============================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));
});


// =============================================
// ENVELOPPE EFFET PARALLAX
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const envelopeOverlay = document.querySelector('.envelope-overlay');
    const envelopeContact = document.querySelector('.envelope-contact');
    const footer = document.querySelector('footer');
    if (!envelopeOverlay || !envelopeContact || !footer) return;

    let currentShift = 0;
    let targetShift = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
        const rect = envelopeContact.getBoundingClientRect();
        const raw = -rect.top * 0.04;
        const envelopeBottom = envelopeContact.getBoundingClientRect().bottom;
        const footerTop = footer.getBoundingClientRect().top;
        const distanceToFooter = footerTop - envelopeBottom;
        const maxShift = Math.max(0, raw - Math.min(0, distanceToFooter - 20));
        targetShift = Math.min(raw, maxShift);
        currentShift = lerp(currentShift, targetShift, 0.08);
        envelopeOverlay.style.transform = `translateY(${currentShift}px)`;
        requestAnimationFrame(animate);
    }

    animate();
});


// =============================================
// AUDIO PODCAST
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('audio[id^="audio"]').forEach(audio => {
        const num = audio.id.replace('audio', '');
        const progressBar = document.getElementById('progressBar' + num);
        const currentTimeEl = document.getElementById('currentTime' + num);
        const durationEl = document.getElementById('duration' + num);
        const volumeSlider = document.getElementById('volumeSlider' + num);
        initProgressBar(audio.id);

        const setDuration = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                durationEl.textContent = formatTime(audio.duration);
            }
        };
        audio.addEventListener('loadedmetadata', setDuration);
        audio.addEventListener('durationchange', setDuration);
        if (audio.readyState >= 1) setDuration();

        audio.addEventListener('timeupdate', () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            progressBar.style.width = pct + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener('ended', () => {
            document.getElementById('playBtn' + num).querySelector('.play-icon').style.display = 'block';
            document.getElementById('playBtn' + num).querySelector('.pause-icon').style.display = 'none';
            progressBar.style.width = '0%';
            currentTimeEl.textContent = '0:00';
        });

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

    bar.addEventListener('mousedown', (e) => { isDragging = true; seek(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) seek(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });
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