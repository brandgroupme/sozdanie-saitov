import { siteConfig } from './config.js';

const $ = (selector, root = document) => root.querySelector(selector);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !mediaQuery.matches;
try { if (sessionStorage.getItem('site:motion') === 'off') motion = false; } catch {}
let frameId = 0, lastTime = 0, visualTime = 0, progress = 0, targetProgress = 0;
let patternOverride = null, pattern = 0, artVisible = true, tour = null;
let dimensions = { storyTop: 0, storyHeight: 1, tourEnd: 1 };
const story = $('.story');
const world = $('.world');
const zebraRoute = $('.zebra-route');
const zebraIdle = $('.zebra-idle');
const crowRoute = $('.crow-route');
const chameleonRoute = $('.chameleon-route');
let checks = null, wing = null;
let artworkLoaded = false;

// SVG is authored locally. External <img> remains a stable first frame if loading fails.
async function loadIllustration(id, path) {
  const holder = $(id);
  if (!holder) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('illustration');
    const source = await response.text();
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    const svg = doc.documentElement;
    if (svg.tagName !== 'svg' || svg.querySelector('parsererror,script,foreignObject')) throw new Error('svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    holder.replaceChildren(document.importNode(svg, true));
  } catch { holder.dataset.fallback = 'image'; }
}

function measure() {
  if (!story) return;
  dimensions.storyTop = story.getBoundingClientRect().top + scrollY;
  dimensions.storyHeight = Math.max(1, story.offsetHeight - innerHeight * .35);
  const destination = $('#contact');
  dimensions.tourEnd = Math.max(1, Math.min(document.documentElement.scrollHeight - innerHeight,
    (destination?.getBoundingClientRect().top ?? 0) + scrollY - 48));
  updateTarget();
  if (tour) stopTour('Размер окна изменился. Просмотр остановлен.');
  requestFrame();
}

function updateTarget() {
  targetProgress = clamp((scrollY - dimensions.storyTop + innerHeight * .12) / dimensions.storyHeight);
  if (!motion) { progress = targetProgress; pattern = patternOverride ?? clamp(progress * 1.5); render(0); }
}

function render(time) {
  if (!world) return;
  const mobile = innerWidth <= 760;
  const travelX = motion ? Math.sin(progress * Math.PI) * (mobile ? 12 : 36) : 0;
  const travelY = motion ? progress * (mobile ? 4 : 18) : 0;
  const idleY = motion ? Math.sin(time * 1.6) * 2 : 0;
  // Route, flat orientation and idle occupy different nodes. No rotateY or simulated 3D.
  zebraRoute.style.transform = `translate(${travelX.toFixed(2)}px,${travelY.toFixed(2)}px)`;
  zebraIdle.style.transform = `translateY(${idleY.toFixed(2)}px) rotate(${motion ? Math.sin(time * .7) * .25 : 0}deg)`;
  $('.zebra-orientation').style.transform = `rotate(${motion ? Math.sin(progress * Math.PI) * -1 : 0}deg)`;
  if (checks) checks.setAttribute('opacity', pattern.toFixed(3));
  world.dataset.pattern = pattern.toFixed(2);
  world.dataset.progress = progress.toFixed(3);
  $('.note-second').style.opacity = clamp((pattern - .35) * 1.6).toFixed(3);
  $('.note-first').style.opacity = (1 - pattern * .7).toFixed(3);
  const birdX = motion ? Math.sin(time * .6) * 8 - progress * 32 : 0;
  const birdY = motion ? Math.sin(time * 1.8) * 7 + progress * 10 : 0;
  crowRoute.style.transform = `translate(${birdX.toFixed(2)}px,${birdY.toFixed(2)}px) rotate(${motion ? Math.sin(time * 1.8) * 3 : -4}deg)`;
  if (wing) wing.setAttribute('transform', `rotate(${motion ? Math.sin(time * 4.8) * 9 : 0} 115 93)`);
  chameleonRoute.style.transform = `translateX(${motion ? progress * 22 + Math.sin(time * .4) * 2 : 0}px)`;
}

function requestFrame() {
  if (!frameId && !document.hidden && (artVisible && motion || tour)) frameId = requestAnimationFrame(tick);
}

// One RAF owner for route, idle and guided scroll. Delta time makes easing refresh-rate independent.
function tick(now) {
  frameId = 0;
  const dt = lastTime ? Math.min(.05, (now - lastTime) / 1000) : 1 / 60;
  lastTime = now;
  if (motion && artVisible) visualTime += dt;
  progress += (targetProgress - progress) * (1 - Math.exp(-8 * dt));
  const targetPattern = patternOverride ?? clamp(progress * 1.5);
  pattern += (targetPattern - pattern) * (1 - Math.exp(-7 * dt));
  if (tour) {
    const fraction = clamp((now - tour.startedAt) / tour.duration);
    window.scrollTo({ top: tour.from + tour.distance * fraction, behavior: 'instant' });
    updateTarget();
    if (fraction === 1) stopTour('Вы дошли до заявки. Дальше можно продолжить самостоятельно.');
  }
  if (artVisible) render(visualTime);
  requestFrame();
}

function reflectMotion() {
  const button = $('#motion-toggle');
  if (!button) return;
  button.setAttribute('aria-pressed', String(motion));
  $('span:last-child', button).textContent = motion ? 'Движение вкл.' : 'Движение выкл.';
  document.documentElement.dataset.motion = motion ? 'on' : 'off';
  if (!motion) {
    stopTour();
    cancelAnimationFrame(frameId); frameId = 0; lastTime = 0;
    updateTarget(); render(0);
  } else { lastTime = 0; requestFrame(); }
}

function stopTour(message) {
  if (!tour) return;
  tour = null;
  $('#tour-toggle').textContent = 'Провести по сайту';
  $('#tour-toggle').setAttribute('aria-pressed', 'false');
  if (message) $('.tour-status').textContent = message;
}

function toggleTour() {
  if (tour) { stopTour('Просмотр остановлен.'); return; }
  if (!motion || mediaQuery.matches) {
    $('.tour-status').textContent = 'Автопросмотр отключён вместе с движением. Разделы доступны в меню.';
    return;
  }
  const from = scrollY;
  const distance = dimensions.tourEnd - from;
  if (distance < 20) { $('.tour-status').textContent = 'Вы уже у заявки. Вернитесь к началу, чтобы посмотреть историю.'; return; }
  const seconds = Number($('#tour-pace').value);
  // Tempo describes the actual remaining path in CSS pixels, at a speed derived from full route duration.
  const pixelsPerSecond = dimensions.tourEnd / seconds;
  tour = { from, distance, duration: Math.max(1000, distance / pixelsPerSecond * 1000), startedAt: performance.now() };
  $('#tour-toggle').textContent = 'Остановить просмотр';
  $('#tour-toggle').setAttribute('aria-pressed', 'true');
  $('.tour-status').textContent = 'Просмотр начался. Прокрутка, касание или клавиша его остановят.';
  requestFrame();
}

$('.pattern-toggle')?.addEventListener('click', () => {
  const button = $('.pattern-toggle');
  const selected = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(selected));
  $('span:last-child', button).textContent = selected ? 'Вернуть полоски' : 'Примерить клеточку';
  patternOverride = selected ? 1 : 0;
  if (!motion) { pattern = patternOverride; render(0); }
  else requestFrame();
});

$('#motion-toggle')?.addEventListener('click', () => {
  motion = !motion;
  try { sessionStorage.setItem('site:motion', motion ? 'on' : 'off'); } catch {}
  reflectMotion();
});
mediaQuery.addEventListener('change', () => { motion = !mediaQuery.matches; reflectMotion(); });
$('#tour-toggle')?.addEventListener('click', toggleTour);
$('#tour-pace')?.addEventListener('change', () => stopTour('Темп изменён. Запустите просмотр снова.'));
['wheel', 'touchstart', 'pointerdown'].forEach(type => addEventListener(type, event => {
  if (event.target instanceof Element && event.target.closest('#tour-toggle')) return;
  stopTour();
}, { passive: true }));
addEventListener('keydown', event => {
  if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Escape','Tab'].includes(event.key)
    && !(event.target?.id === 'tour-toggle' && event.key === ' ')) stopTour();
  if (event.key === 'Escape') closeMenu();
});
addEventListener('scroll', () => { updateTarget(); requestFrame(); }, { passive: true });
addEventListener('resize', measure, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; lastTime = 0; stopTour(); }
  else requestFrame();
});

const menuButton = $('.menu-toggle');
const menu = $('#mobile-nav');
function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute('aria-expanded', String(!menu.hidden));
});
document.addEventListener('click', event => {
  if (menu && !event.target.closest('.header')) closeMenu();
});
menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.querySelectorAll('[data-format]').forEach(link => link.addEventListener('click', () => {
  $('#format').value = link.dataset.format;
  $('#form-status').textContent = `Выбран формат «${link.dataset.format}». Расскажите о задаче.`;
}));
const chosenFormat = new URLSearchParams(location.search).get('format');
if (chosenFormat && $('#format')) {
  const allowed = [...$('#format').options].map(option => option.value);
  if (allowed.includes(chosenFormat)) $('#format').value = chosenFormat;
}

const dialog = $('#brief-dialog');
let formTrigger = null;
$('#brief-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const name = $('#name').value.trim(), task = $('#task').value.trim();
  if (!name || !task) { $('#form-status').textContent = 'Добавьте имя и описание задачи.'; return; }
  const text = `Здравствуйте, Евгения! Меня зовут ${name}.\n\nНужен сайт: ${$('#format').value}.\nЗадача: ${task}\n\nХочу обсудить подход, сроки и стоимость.`;
  $('#brief-message').value = text;
  $('#copy-status').textContent = '';
  formTrigger = $('button[type=submit]', event.currentTarget);
  dialog.showModal();
});
$('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog?.addEventListener('close', () => { $('#brief-message').value = ''; formTrigger?.focus({ preventScroll: true }); });
$('#copy-brief')?.addEventListener('click', async () => {
  const message = $('#brief-message');
  try {
    await navigator.clipboard.writeText(message.value);
    $('#copy-status').textContent = 'Текст скопирован. Откройте MAX и вставьте его в диалог.';
  } catch {
    message.focus(); message.select();
    $('#copy-status').textContent = 'Автокопирование недоступно. Скопируйте выделенный текст или скачайте заявку.';
  }
});
$('#download-brief')?.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('#brief-message').value], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'zayavka-na-sait.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#copy-status').textContent = 'Заявка скачана. Отправьте её Евгении в MAX.';
});

if (story) {
  reflectMotion(); measure();
  new ResizeObserver(measure).observe(story);
  const observer = new IntersectionObserver(entries => {
    artVisible = entries[0].isIntersecting;
    if (artVisible) requestFrame();
    else if (!tour) { cancelAnimationFrame(frameId); frameId = 0; lastTime = 0; }
  }, { rootMargin: '100px' });
  observer.observe(world);
  Promise.all([loadIllustration('#zebra','assets/zebra.svg'),loadIllustration('#crow','assets/crow.svg'),loadIllustration('#chameleon','assets/chameleon.svg')]).then(() => {
    checks = $('.checks', zebraIdle); wing = $('.wing', crowRoute); artworkLoaded = true;
    render(visualTime); requestFrame();
  });
}

// Public diagnostic data contains no form contents or personal information.
window.siteExperience = Object.freeze({
  get state() { return { motion, reducedMotion: mediaQuery.matches, tourActive: !!tour, progress, pattern, artworkLoaded, mediaMode: siteConfig.mediaMode }; }
});
