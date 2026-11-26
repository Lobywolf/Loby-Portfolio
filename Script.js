const screens = ['inicio', 'herramientas', 'proyectos', 'trayectoria'];
const slider = document.querySelector('.slider-container');
const wrapper = document.querySelector('.slider-wrapper');
const navLinks = document.querySelector('.nav-links');
const mainLinks = [...navLinks.querySelectorAll('a')];
const screenArrows = [...document.querySelectorAll('[data-screen-step]')];
const categoryTrack = document.querySelector('.category-track');
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const categoryPanels = [...document.querySelectorAll('.category')];
const experienceLabels = document.querySelectorAll('[data-experience-since]');
const previousProjectRoutes = new Map([
    ['jemo', 'jemo-1'],
    ['ptj', 'ptj-1'],
    ['ppe', 'ppe-1'],
]);
let currentScreen = 'inicio';
let currentCategory = 0;
let cancelHomeScroll;

function updateToolExperience() {
    const today = new Date();
    const currentYear = today.getUTCFullYear();

    experienceLabels.forEach(label => {
        const [year, month = 1, day = 1] = label.dataset.experienceSince.split('-').map(Number);
        const anniversary = Date.UTC(currentYear, month - 1, day);
        const years = currentYear - year - (today.getTime() < anniversary ? 1 : 0);
        let duration = 'Menos de 1 año';
        if (years > 0) {
            const prefix = label.hasAttribute('data-experience-approximate') ? 'Aprox. ' : '';
            duration = `${prefix}${years} ${years === 1 ? 'año' : 'años'}`;
        }
        if (label.textContent !== duration) label.textContent = duration;
    });
}

function adjustSliderHeight() {
    categoryTrack.style.height = `${categoryPanels[currentCategory].offsetHeight}px`;
    const panel = document.getElementById(currentScreen);
    wrapper.style.height = `${panel.offsetHeight}px`;
}

function alignNavIndicator() {
    const activeLink = mainLinks.find(link => link.hash === `#${currentScreen}`);
    navLinks.style.setProperty('--indicator-x', `${activeLink.offsetLeft}px`);
    navLinks.style.setProperty('--indicator-y', `${activeLink.offsetTop + activeLink.offsetHeight - 2}px`);
    navLinks.style.setProperty('--indicator-width', `${activeLink.offsetWidth}px`);
}

function updateLayout() {
    adjustSliderHeight();
    alignNavIndicator();
}

function selectCategory(id) {
    currentCategory = categoryPanels.findIndex(panel => panel.id === id);
    categoryTrack.style.transform = `translateX(-${currentCategory * 100}%)`;
    categoryButtons.forEach(button => {
        const selected = button.dataset.category === id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
    });
    categoryPanels.forEach(panel => {
        const active = panel.id === id;
        panel.inert = !active;
        panel.setAttribute('aria-hidden', String(!active));
    });
}

function showScreen(id, resetScroll = true) {
    if (!screens.includes(id)) return;
    currentScreen = id;
    screens.forEach(screen => {
        const panel = document.getElementById(screen);
        const active = screen === id;
        panel.classList.toggle('active-panel', active);
        panel.inert = !active;
        panel.setAttribute('aria-hidden', String(!active));
    });
    const index = screens.indexOf(id);
    wrapper.style.transform = `translateX(-${index * 100}%)`;
    mainLinks.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    screenArrows.forEach(button => {
        const destination = mainLinks[index + Number(button.dataset.screenStep)];
        button.disabled = !destination;
        button.title = destination?.textContent.trim() ?? '';
    });
    // La posición horizontal pertenece al slide, nunca al scroll de un ancla.
    slider.scrollLeft = 0;
    updateLayout();
    if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' });
}

function followRoute() {
    cancelHomeScroll?.();
    const id = window.location.hash.slice(1) || 'inicio';
    if (screens.includes(id)) return showScreen(id);
    const projectId = previousProjectRoutes.get(id) ?? id.replace(/^(jemo|ptj|ppe)-area-([1-4])$/, '$1-$2');
    const category = document.getElementById(projectId)?.closest('.category');
    if (category) {
        selectCategory(category.id);
        return showScreen('proyectos');
    }
    showScreen(currentScreen, false);
}

function navigateTo(target, focusHeading = true) {
    const hash = `#${target.id}`;
    if (window.location.hash !== hash) history.pushState(null, '', hash);
    followRoute();
    const heading = focusHeading && target.querySelector('h1, h2, h3');
    if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
    }
}

function returnHome(target) {
    if (window.scrollY <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return navigateTo(target);
    }
    cancelHomeScroll?.();

    // Conserva la altura de la pestaña actual hasta llegar arriba.
    const finish = () => navigateTo(target);
    const checkPosition = () => {
        if (window.scrollY <= 1) finish();
    };
    const fallback = window.setTimeout(finish, 1600);
    cancelHomeScroll = () => {
        window.removeEventListener('scroll', checkPosition);
        window.clearTimeout(fallback);
        cancelHomeScroll = undefined;
    };
    window.addEventListener('scroll', checkPosition, { passive: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Flechas, Inicio y Fin para recorrer las pestañas con teclado.
function setupKeyboard(tablist) {
    tablist.addEventListener('keydown', event => {
        const buttons = [...tablist.querySelectorAll('[role="tab"]')];
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        buttons[next].focus();
        buttons[next].click();
    });
}

categoryButtons.forEach(button => button.addEventListener('click', () => {
    cancelHomeScroll?.();
    const id = button.dataset.category;
    selectCategory(id);
    history.replaceState(null, '', `#${id}`);
    adjustSliderHeight();
}));
setupKeyboard(document.querySelector('.category-tabs'));
screenArrows.forEach(button => button.addEventListener('click', () => {
    const index = screens.indexOf(currentScreen) + Number(button.dataset.screenStep);
    const id = screens[index];
    if (!id) return;
    navigateTo(document.getElementById(id), false);
    if (button.disabled) mainLinks[index].focus({ preventScroll: true });
}));
document.querySelectorAll('a[href^="#"]').forEach(link => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target || link.hash === '#contenido') return;
    link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // Evita que el navegador desplace el contenedor hasta la sección
        // mientras translateX ya está animando esa misma navegación.
        event.preventDefault();
        if (link.hasAttribute('data-smooth-home')) returnHome(target);
        else navigateTo(target);
    });
});
updateToolExperience();
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateToolExperience();
});
selectCategory(categoryButtons[0].dataset.category);
document.documentElement.classList.add('js');
followRoute();
window.addEventListener('hashchange', followRoute);

window.addEventListener('popstate', followRoute);
window.addEventListener('resize', updateLayout);
if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(updateLayout);
    screens.forEach(id => resizeObserver.observe(document.getElementById(id)));
    categoryPanels.forEach(panel => resizeObserver.observe(panel));
    mainLinks.forEach(link => resizeObserver.observe(link));
}
// Las fuentes y las imágenes pueden cambiar la altura después del primer render.
window.addEventListener('load', updateLayout);
