// Menu hamburger
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbar = document.getElementById('navbar');

hamburgerBtn.addEventListener('click', () => {
    // Bascule la classe "active" sur le parent nav
    navbar.classList.toggle('active');
});

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