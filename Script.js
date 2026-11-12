const screens = ['inicio', 'proyectos', 'trayectoria'];
const wrapper = document.querySelector('.slider-wrapper');
const mainLinks = document.querySelectorAll('.nav-links a');
const companyButtons = [...document.querySelectorAll('[data-case]')];
const cases = [...document.querySelectorAll('.case')];
let currentCase = 'jemo';
let currentScreen = 'inicio';
const slider = document.querySelector('.slider-container');

function adjustSliderHeight() {
    const panel = document.getElementById(currentScreen);
    wrapper.style.height = `${panel.offsetHeight}px`;
}


function selectArea(brand, panelId) {
    brand.querySelectorAll('[data-area]').forEach(button => {
        const selected = button.dataset.area === panelId;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        document.getElementById(button.dataset.area).hidden = !selected;
    });
}

function selectCase(id) {
    currentCase = id;
    companyButtons.forEach(button => {
        const selected = button.dataset.case === id;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
    });
    cases.forEach(brand => { brand.hidden = brand.id !== id; });
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
    wrapper.style.transform = `translateX(-${screens.indexOf(id) * 100}%)`;
    mainLinks.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    // La posición horizontal pertenece al slide, nunca al scroll de un ancla.
    slider.scrollLeft = 0;
    adjustSliderHeight();
    if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' });
}

function followRoute() {
    const id = window.location.hash.slice(1) || 'inicio';
    if (screens.includes(id)) return showScreen(id);
    const brand = cases.find(item => item.id === id || item.querySelector(`[id="${CSS.escape(id)}"]`));
    if (brand) {
        selectCase(brand.id);
        if (document.getElementById(id)?.classList.contains('work-block')) selectArea(brand, id);
        showScreen('proyectos');
    }
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

cases.forEach(brand => {
    const buttons = [...brand.querySelectorAll('[data-area]')];
    if (buttons.length) selectArea(brand, buttons[0].dataset.area);
    buttons.forEach(button => button.addEventListener('click', () => {
        selectArea(brand, button.dataset.area);
        history.replaceState(null, '', `#${button.dataset.area}`);
        adjustSliderHeight();
    }));
});
companyButtons.forEach(button => button.addEventListener('click', () => {
    selectCase(button.dataset.case);
    history.replaceState(null, '', `#${currentCase}`);
    adjustSliderHeight();
}));
document.querySelectorAll('[role="tablist"]').forEach(setupKeyboard);
document.querySelectorAll('a[href^="#"]').forEach(link => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target || link.hash === '#contenido') return;
    link.addEventListener('click', event => {
        // Evita que el navegador desplace el contenedor hasta la sección
        // mientras translateX ya está animando esa misma navegación.
        event.preventDefault();
        if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
        followRoute();
    });
});
selectCase(currentCase);
document.documentElement.classList.add('js');
followRoute();
window.addEventListener('hashchange', followRoute);

window.addEventListener('popstate', followRoute);
window.addEventListener('resize', adjustSliderHeight);
if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(adjustSliderHeight);
    screens.forEach(id => resizeObserver.observe(document.getElementById(id)));
}
// Las fuentes y las imágenes pueden cambiar la altura después del primer render.
window.addEventListener('load', adjustSliderHeight);
