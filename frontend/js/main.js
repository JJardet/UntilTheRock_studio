// ============================================================
// ROUTER
// ============================================================
const routes = {
  '/': homePage,
  '/portfolio': portfolioPage,
  '/portfolio/materiel': portfolioMaterielPage,
  '/portfolio/studio': portfolioStudioPage,
  '/portfolio/enregistrement': portfolioRecordingPage,
  '/reservation-materiel': reservationMaterielPage,
  '/reservation-studio': reservationStudioPage,
  '/enregistrement': enregistrementPage,
  '/evenements': eventsPage,
  '/contact': contactPage,
  '/admin-login': adminLoginPage,
  '/admin-dashboard': adminDashboardPage,
  '/admin-portfolio': adminPortfolioPage,
  '/mentions-legales': mentionsLegalesPage,
  '/politique-confidentialite': politiqueConfidentialitePage,
  '/cgv': cgvPage,
  '/calendrier': calendarPage,
  '/admin-calendrier': adminCalendarPage,
  '/admin-evenements': adminEventsPage,
};

function navigateTo(path) {
  window.history.pushState({}, '', path);
  renderPage(path);
  updateActiveLink(path);
  window.scrollTo(0, 0);
  if (window.innerWidth <= 768) {
    document.querySelector('.nav-links').classList.remove('active');
  }
}

function renderPage(path) {
  const app = document.getElementById('app');
  const page = routes[path] || routes['/'];
  app.classList.toggle('public-page', !path.startsWith('/admin'));
  app.innerHTML = page();
}

function updateActiveLink(path) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === path) link.classList.add('active');
  });
}

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('active');
}

window.addEventListener('scroll', () => {
  document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
});

window.addEventListener('popstate', () => {
  renderPage(window.location.pathname);
  updateActiveLink(window.location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
  renderPage(window.location.pathname);
  updateActiveLink(window.location.pathname);
});

// ============================================================
// PAGES PUBLIQUES
// ============================================================
function homePage() {
  return `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1>Bienvenue chez UntilTheRock</h1>
        <p>Votre studio d'enregistrement professionnel. Enregistrement et location de matériel — tout pour votre projet musical.</p>
        <div class="cta-buttons">
          <button class="btn btn-primary" onclick="navigateTo('/reservation-studio')">Réserver un Studio</button>
          <button class="btn btn-outline" onclick="navigateTo('/contact')">Nous Contacter</button>
        </div>
      </div>
    </section>
    ${renderHomeStudioTour('home-tour-top', '/assets/uploads/videos/854923-hd-1920-1080-25fps-1768848893786-738266821.mp4', 'Version A · avant les services')}
    ${renderAboutSnippet()}
    <section class="section">
      <h2 class="section-title">Nos Services</h2>
      <div class="services-grid">
        <div class="service-card" onclick="navigateTo('/reservation-materiel')">
          <div class="service-icon">1</div>
          <h3>Location de Matériel</h3>
          <p>Louez du matériel professionnel pour vos projets : micros, instruments, effets et plus encore.</p>
        </div>
        <div class="service-card" onclick="navigateTo('/reservation-studio')">
          <div class="service-icon">2</div>
          <h3>Réservation Studio</h3>
          <p>Réservez nos studios d'enregistrement équipés du meilleur matériel audio.</p>
        </div>
        <div class="service-card" onclick="navigateTo('/enregistrement')">
          <div class="service-icon">3</div>
          <h3>Sessions d'Enregistrement</h3>
          <p>Enregistrez vos morceaux avec nos ingénieurs son expérimentés.</p>
        </div>
      </div>
    </section>
  `;
}

function renderHomeStudioTour(id, video, label) {
  return `<section class="home-studio-tour ${id}"><div class="home-tour-copy"><span class="eyebrow">DANS LE STUDIO</span><h2>Studio tour</h2><p>${label}</p></div><div class="daw-window home-daw-window"><div class="daw-titlebar"><span class="traffic-lights"><b></b><b></b><b></b></span><span>UNTILTHEROCK · STUDIO TOUR</span><span>REC</span></div><div class="video-frame"><video controls preload="metadata"><source src="${video}"></video></div><div class="daw-timeline"><span>LIVE</span><div><i></i></div><span>STUDIO TOUR</span></div></div></section>`;
}

function reservationMaterielPage() {
  setTimeout(() => {
    document.getElementById('equipment-form')?.addEventListener('submit', handleEquipmentBooking);
    loadPortfolioItems('equipment');
  }, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Location de Matériel</h2>
      <div class="equipment-pack-grid">
        ${renderEquipmentPack('Pack son', 'Une solution complète pour sonoriser votre événement.', 'Enceintes, table de mixage, micros et câblage.')}
        ${renderEquipmentPack('Pack lumière', 'Créez une ambiance scénique sur mesure.', 'Projecteurs LED, pieds, contrôleur et effets.')}
        ${renderEquipmentPack('Son à l’unité', 'Composez votre configuration audio.', 'Micros, enceintes, retours, consoles et accessoires.')}
        ${renderEquipmentPack('Lumière à l’unité', 'Complétez votre installation lumineuse.', 'PAR LED, lyres, machines à fumée et structures.')}
        ${renderEquipmentPack('Accessoires', 'Les détails qui font la différence.', 'Pieds, câbles, DI, multipaires et supports.')}
      </div>
      ${renderInlinePortfolio('Notre matériel en photos')}
      <div class="form-container">
        <form id="equipment-form">
          <div class="form-group"><label>Nom complet *</label><input type="text" name="name" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" required></div>
          <div class="form-group"><label>Téléphone *</label><input type="tel" name="phone" required></div>
          <div class="form-group">
            <label>Votre besoin matériel *</label>
            <textarea name="equipment" required placeholder="Décrivez le matériel dont vous avez besoin, les quantités, le type d’événement et toute contrainte technique..."></textarea>
          </div>
          <div class="form-group"><label>Date de début *</label><input type="date" name="start_date" required></div>
          <div class="form-group"><label>Date de fin *</label><input type="date" name="end_date" required></div>
          <div class="form-group"><label>Message / Précisions</label><textarea name="message"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Réserver</button>
        </form>
      </div>
    </section>
  `;
}

function renderEquipmentPack(title, text, details) {
  return `<article class="equipment-pack"><img src="/assets/generated/studio-showcase-v1.png" alt="${title}"><div><h3>${title}</h3><p>${text}</p><small>${details}</small></div></article>`;
}

function reservationStudioPage() {
  setTimeout(() => {
    document.getElementById('studio-form')?.addEventListener('submit', handleStudioBooking);
    loadPortfolioItems('studio');
    initRoomCalendars();
  }, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Réservation salle de répétition</h2>
      ${renderInlinePortfolio('Notre studio en photos')}
      <section class="room-calendar-section" aria-label="Disponibilités des salles">
        <div class="room-calendar-heading"><div><span class="eyebrow">DISPONIBILITÉS EN DIRECT</span><h3>Choisissez votre salle</h3></div><button class="btn btn-outline" onclick="roomCalendarPrev()">‹</button><strong id="room-cal-label"></strong><button class="btn btn-outline" onclick="roomCalendarNext()">›</button></div>
        <div class="room-calendar-grid">
          <div class="room-calendar"><h4><i></i>Salle de répétition A</h4><p>Grand format · idéale pour les groupes</p><div id="room-calendar-A" class="mini-calendar"></div></div>
          <div class="room-calendar"><h4><i></i>Salle de répétition B</h4><p>Configuration compacte et précise</p><div id="room-calendar-B" class="mini-calendar"></div></div>
        </div>
        <p class="room-calendar-note">Les créneaux affichés en rouge sont déjà demandés. La réservation reste soumise à confirmation.</p>
      </section>
      <div class="form-container">
        <form id="studio-form">
          <div class="form-group"><label>Nom complet *</label><input type="text" name="name" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" required></div>
          <div class="form-group"><label>Téléphone *</label><input type="tel" name="phone" required></div>
          <div class="form-group">
            <label>Type de studio *</label>
            <select name="studio_type" required>
              <option value="">Sélectionnez...</option>
              <option value="Studio A - Grand format">Salle de répétition A — Grand format</option>
              <option value="Studio B - Enregistrement">Salle de répétition B — Configuration compacte</option>
              <option value="Studio C - Mixage">Studio C - Mixage</option>
            </select>
          </div>
          <div class="form-group"><label>Date *</label><input type="date" name="date" required></div>
          <div class="form-group">
            <label>Créneau horaire *</label>
            <select name="time_slot" required>
              <option value="">Sélectionnez...</option>
              <option value="09h00 - 12h00">09h00 - 12h00</option>
              <option value="12h00 - 15h00">12h00 - 15h00</option>
              <option value="15h00 - 18h00">15h00 - 18h00</option>
              <option value="18h00 - 21h00">18h00 - 21h00</option>
              <option value="21h00 - 00h00">21h00 - 00h00</option>
            </select>
          </div>
          <div class="form-group"><label>Durée (heures) *</label><input type="number" name="duration" min="1" max="12" required></div>
          <div class="form-group"><label>Message / Projet</label><textarea name="message"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Réserver</button>
        </form>
      </div>
    </section>
  `;
}


function enregistrementPage() {
  setTimeout(() => {
    document.getElementById('recording-form')?.addEventListener('submit', handleRecordingSession);
    loadPortfolioItems('recording');
    loadRecordingShowcase();
  }, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Session d'Enregistrement</h2>
      <section class="recording-showcase">
        <div class="daw-window video-daw">
          <div class="daw-titlebar"><span class="traffic-lights"><b></b><b></b><b></b></span><span>UNTILTHEROCK · STUDIO TOUR.mov</span><span>REC</span></div>
          <div class="video-frame"><video controls preload="metadata" poster="/assets/uploads/images/UntilTheRock.png"><source src="/assets/uploads/videos/854923-hd-1920-1080-25fps-1768848893786-738266821.mp4" type="video/mp4"></video></div>
          <div class="daw-timeline"><span>01:02:14</span><div><i></i></div><span>STUDIO TOUR</span></div>
        </div>
        <div class="daw-window audio-daw">
          <div class="daw-titlebar"><span class="traffic-lights"><b></b><b></b><b></b></span><span>UNTILTHEROCK · MIX SESSIONS</span><span>48 kHz</span></div>
          <div id="recording-playlist" class="recording-playlist"><p>Chargement des productions…</p></div>
        </div>
      </section>
      ${renderInlinePortfolio('Nos sessions en photos')}
      <div class="form-container">
        <form id="recording-form" enctype="multipart/form-data">
          <div class="form-group"><label>Nom du groupe/artiste*</label><input type="text" name="name" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" required></div>
          <div class="form-group"><label>Téléphone *</label><input type="tel" name="phone" required></div>
          <div class="form-group">
            <label>Type de projet *</label>
            <select name="project_type" required>
              <option value="">Sélectionnez...</option>
              <option value="Single">Single</option>
              <option value="EP">EP</option>
              <option value="Album">Album</option>
              <option value="Démo">Démo</option>
              <option value="Voix-off">Voix-off</option>
            </select>
          </div>
          <div class="form-group"><label>Nombre de musiciens *</label><input type="number" name="nb_musiciens" required></div>
          <div class="form-group"><label>Instruments *</label><input type="text" name="instruments" required></div>
          <div class="form-group"><label>Vos réseaux sociaux</label><input type="text" name="social"></div>
          <div class="form-group">
            <label>Votre maquette (audio ou vidéo)</label>
            <input type="file" name="demo" id="recording-demo-upload" accept="audio/*,video/*" style="display: none;" onchange="updateRecordingDemoLabel(this)">
            <label for="recording-demo-upload" class="btn btn-outline" style="display: inline-block; cursor: pointer;">📁 Ajouter un fichier</label>
            <span id="recording-demo-name" style="display: block; color: var(--gray); margin-top: 0.75rem;">Aucun fichier sélectionné</span>
            <small style="color: var(--gray); display: block; margin-top: 0.5rem;">Formats audio ou vidéo, 100 Mo maximum.</small>
          </div>
          <div class="form-group"><label>Détails du projet</label><textarea name="message" placeholder="Décrivez votre projet, genre musical, ambiance souhaitée"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Demander un devis</button>
        </form>
      </div>
    </section>
  `;
}

function contactPage() {
  setTimeout(() => {
    document.getElementById('contact-form')?.addEventListener('submit', handleContactForm);
  }, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Contactez-nous</h2>
      <div class="form-container">
        <form id="contact-form">
          <div class="form-group"><label>Nom complet *</label><input type="text" name="name" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" required></div>
          <div class="form-group"><label>Sujet *</label><input type="text" name="subject" required></div>
          <div class="form-group"><label>Message *</label><textarea name="message" required></textarea></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Envoyer</button>
        </form>
      </div>
    </section>
  `;
}

function renderAboutSnippet() {
  return `<section class="section about-page"><span class="eyebrow">L’HISTOIRE DU LIEU</span><h2 class="section-title">Qui sommes-nous ?</h2><div class="about-grid"><img src="/assets/generated/studio-showcase-v1.png" alt="Le studio UntilTheRock"><div><h3>Un studio pensé pour les projets qui comptent.</h3><p>UntilTheRock accompagne les artistes, groupes et organisateurs dans leurs projets d’enregistrement, de répétition et de prestation technique.</p><p>Notre objectif : proposer un lieu accueillant, un matériel fiable et un accompagnement humain, du premier échange jusqu’au rendu final.</p><a class="btn btn-primary" href="/contact" onclick="navigateTo('/contact');return false;">Parlons de votre projet</a></div></div></section>`;
}

// ============================================================
// HANDLERS FORMULAIRES
// ============================================================
async function handleEquipmentBooking(e) {
  e.preventDefault();
  try {
    await api.bookEquipment(Object.fromEntries(new FormData(e.target)));
    alert('Réservation enregistrée. Nous vous contacterons sous 24 h.');
    e.target.reset();
  } catch { alert('Erreur lors de la réservation. Veuillez réessayer.'); }
}

async function handleStudioBooking(e) {
  e.preventDefault();
  try {
    await api.bookStudio(Object.fromEntries(new FormData(e.target)));
    alert('Réservation enregistrée. Nous vous contacterons sous 24 h.');
    e.target.reset();
  } catch { alert('Erreur lors de la réservation. Veuillez réessayer.'); }
}

async function handleRecordingSession(e) {
  e.preventDefault();
  try {
    await api.bookRecording(new FormData(e.target));
    alert('Session enregistrée. Nous vous contacterons sous 24 h.');
    e.target.reset();
  } catch { alert('Erreur lors de l\'envoie du devis. Veuillez réessayer.'); }
}

function updateRecordingDemoLabel(input) {
  document.getElementById('recording-demo-name').textContent = input.files[0]?.name || 'Aucun fichier sélectionné';
}

async function loadRecordingShowcase() {
  const list = document.getElementById('recording-playlist');
  if (!list) return;
  try {
    const items = await api.getPortfolio('recording');
    const audioItems = items.filter(item => item.audio_url);
    if (!audioItems.length) {
      list.innerHTML = '<p class="empty-showcase">Les prochaines productions du studio seront bientôt ici.</p>';
      return;
    }
    list.innerHTML = audioItems.map((item, index) => `
      <div class="audio-track">
        <button aria-label="Lire ${item.title}" onclick="toggleShowcaseTrack(${index}, this)">▶</button>
        <div><strong>${item.title}</strong><span>${item.description || 'Production UntilTheRock'}</span></div>
        <div class="waveform"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <audio preload="metadata"><source src="${item.audio_url}"></audio>
      </div>`).join('');
  } catch { list.innerHTML = '<p class="empty-showcase">Impossible de charger les productions.</p>'; }
}

function toggleShowcaseTrack(index, button) {
  const tracks = [...document.querySelectorAll('.audio-track')];
  const audio = tracks[index]?.querySelector('audio');
  if (!audio) return;
  tracks.forEach((track, i) => {
    const other = track.querySelector('audio');
    const control = track.querySelector('button');
    if (i !== index) { other.pause(); control.textContent = '▶'; track.classList.remove('is-playing'); }
  });
  if (audio.paused) { audio.play(); button.textContent = 'Ⅱ'; tracks[index].classList.add('is-playing'); }
  else { audio.pause(); button.textContent = '▶'; tracks[index].classList.remove('is-playing'); }
  audio.onended = () => { button.textContent = '▶'; tracks[index].classList.remove('is-playing'); };
}

let _roomCalendarState = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
async function initRoomCalendars() { await loadRoomCalendars(); }
async function loadRoomCalendars() {
  const label = document.getElementById('room-cal-label');
  if (!label) return;
  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  label.textContent = `${months[_roomCalendarState.month - 1]} ${_roomCalendarState.year}`;
  const results = await Promise.all(['A', 'B'].map(room => api.getStudioMonth(room, _roomCalendarState.year, _roomCalendarState.month).catch(() => [])));
  ['A', 'B'].forEach((room, i) => renderRoomCalendar(room, results[i]));
}
function renderRoomCalendar(room, bookings) {
  const el = document.getElementById(`room-calendar-${room}`);
  if (!el) return;
  const { year, month } = _roomCalendarState;
  const first = new Date(year, month - 1, 1);
  const start = (first.getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const booked = new Set(bookings.map(item => item.date));
  let html = ['L','M','M','J','V','S','D'].map(d => `<span class="mini-weekday">${d}</span>`).join('');
  html += '<span></span>'.repeat(start);
  for (let day = 1; day <= days; day++) {
    const date = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    html += `<button class="mini-day ${booked.has(date) ? 'is-booked' : ''}" onclick="selectRoomDate('${room}', '${date}')" title="${booked.has(date) ? 'Créneau déjà demandé' : 'Disponible'}">${day}</button>`;
  }
  el.innerHTML = html;
}
function roomCalendarPrev() { if (_roomCalendarState.month === 1) { _roomCalendarState.month=12; _roomCalendarState.year--; } else _roomCalendarState.month--; loadRoomCalendars(); }
function roomCalendarNext() { if (_roomCalendarState.month === 12) { _roomCalendarState.month=1; _roomCalendarState.year++; } else _roomCalendarState.month++; loadRoomCalendars(); }
function selectRoomDate(room, date) { const form=document.getElementById('studio-form'); if (!form) return; form.elements.date.value=date; form.elements.studio_type.value=room === 'A' ? 'Studio A - Grand format' : 'Studio B - Enregistrement'; form.scrollIntoView({behavior:'smooth',block:'start'}); }

function eventsPage() {
  setTimeout(loadEventsPage, 0);
  return `<section class="section events-page" style="padding-top:120px;">
    <span class="eyebrow">VIVRE LA MUSIQUE</span><h2 class="section-title">Événements & prestations</h2>
    <p class="events-intro">Concerts, soirées, prestations techniques et rendez-vous du studio.</p>
    <div class="events-layout"><div><h3 class="events-heading">À la une & à venir</h3><div id="upcoming-events" class="events-feed"><p>Chargement…</p></div><h3 class="events-heading past-heading">Archives</h3><div id="past-events" class="events-feed"></div></div><aside class="events-calendar"><div class="events-cal-header"><button onclick="eventsCalMove(-1)">‹</button><h3>Calendrier</h3><button onclick="eventsCalMove(1)">›</button></div><div id="events-calendar-grid"></div><div class="events-legend"><i></i> Événement programmé</div></aside></div>
  </section>`;
}
async function loadEventsPage() {
  try {
    const events = await api.getEvents(); const today = new Date().toISOString().slice(0,10);
    const upcoming = events.filter(event => event.event_date >= today);
    const past = events.filter(event => event.event_date < today).sort((a,b) => b.event_date.localeCompare(a.event_date));
    renderEventFeed('upcoming-events', upcoming, 'Aucun événement à venir pour le moment.');
    renderEventFeed('past-events', past, 'Les archives arriveront bientôt.');
    renderEventsCalendar(events);
  } catch { document.getElementById('upcoming-events').innerHTML = '<p>Impossible de charger les événements.</p>'; }
}
function renderEventFeed(id, events, empty) {
  const target = document.getElementById(id); if (!target) return;
  target.innerHTML = events.length ? events.map(event => `<article class="event-post">
    ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}">` : '<div class="event-placeholder">UTR</div>'}
    <div class="event-post-body">${event.is_pinned ? '<span class="pinned">📌 ÉPINGLÉ</span>' : ''}<time>${new Date(event.event_date + 'T00:00:00').toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'})}</time><h4>${event.title}</h4>${event.location ? `<p class="event-location">⌖ ${event.location}</p>` : ''}<p>${event.excerpt || event.content || 'Plus d’informations prochainement.'}</p></div>
  </article>`).join('') : `<p class="empty-events">${empty}</p>`;
}
let _eventsCalendarState = { year: new Date().getFullYear(), month: new Date().getMonth() };
function renderEventsCalendar(events) {
  const el = document.getElementById('events-calendar-grid'); if (!el) return;
  window._eventsForCalendar = events;
  const { year, month } = _eventsCalendarState;
  const count = new Date(year, month + 1, 0).getDate(), start = (new Date(year,month,1).getDay()+6)%7;
  const dates = new Set(events.filter(e => e.event_date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).map(e => e.event_date));
  let html = `<strong class="event-calendar-month">${new Date(year, month, 1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</strong>`;
  html += ['L','M','M','J','V','S','D'].map(d=>`<span class="mini-weekday">${d}</span>`).join('') + '<span></span>'.repeat(start);
  for (let d=1; d<=count; d++) { const key=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; html += `<span class="event-day ${dates.has(key)?'has-event':''}">${d}</span>`; }
  el.innerHTML=html;
}
function eventsCalMove(direction) { _eventsCalendarState.month += direction; if (_eventsCalendarState.month < 0) { _eventsCalendarState.month=11; _eventsCalendarState.year--; } if (_eventsCalendarState.month > 11) { _eventsCalendarState.month=0; _eventsCalendarState.year++; } renderEventsCalendar(window._eventsForCalendar || []); }

async function handleContactForm(e) {
  e.preventDefault();
  try {
    await api.sendContact(Object.fromEntries(new FormData(e.target)));
    alert('Message envoyé. Nous vous répondrons rapidement.');
    e.target.reset();
  } catch { alert('Erreur lors de l\'envoi. Veuillez réessayer.'); }
}

// ============================================================
// PAGES LÉGALES
// ============================================================
function mentionsLegalesPage() {
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Mentions Légales</h2>
      <div class="form-container" style="max-width: 800px;">
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Éditeur du site</h3>
        <p style="color: var(--gray); line-height: 1.8;">UntilTheRock Studio<br>SIRET: [À REMPLIR]<br>Adresse: [À REMPLIR]<br>Téléphone: [À REMPLIR]<br>Email: contact@untiltherock.com</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Hébergement</h3>
        <p style="color: var(--gray); line-height: 1.8;">Ce site est hébergé par [NOM HÉBERGEUR]<br>Adresse: [ADRESSE HÉBERGEUR]</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Propriété intellectuelle</h3>
        <p style="color: var(--gray); line-height: 1.8;">L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.</p>
      </div>
    </section>`;
}

function politiqueConfidentialitePage() {
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Politique de Confidentialité</h2>
      <div class="form-container" style="max-width: 800px;">
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Collecte des données</h3>
        <p style="color: var(--gray); line-height: 1.8;">Les données personnelles collectées via les formulaires de ce site sont utilisées uniquement pour traiter vos demandes de réservation et vous contacter. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Utilisation des données</h3>
        <p style="color: var(--gray); line-height: 1.8;">Vos données ne sont jamais vendues ou partagées avec des tiers. Elles sont stockées de manière sécurisée et conservées uniquement le temps nécessaire au traitement de votre demande.</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Contact</h3>
        <p style="color: var(--gray); line-height: 1.8;">Pour toute question concernant vos données personnelles: contact@untiltherock.com</p>
      </div>
    </section>`;
}

function cgvPage() {
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Conditions Générales de Vente</h2>
      <div class="form-container" style="max-width: 800px;">
        <h3 style="color: var(--primary); margin-bottom: 1rem;">Article 1 - Objet</h3>
        <p style="color: var(--gray); line-height: 1.8;">Les présentes CGV régissent les relations entre UntilTheRock Studio et ses clients pour les services de location de matériel, réservation de studio et enregistrement.</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Article 2 - Réservations</h3>
        <p style="color: var(--gray); line-height: 1.8;">Toute réservation est confirmée après validation par UntilTheRock Studio. Un acompte peut être demandé pour confirmer la réservation.</p>
        <h3 style="color: var(--primary); margin: 2rem 0 1rem;">Article 3 - Tarifs</h3>
        <p style="color: var(--gray); line-height: 1.8;">Les tarifs sont indiqués en euros TTC. Ils sont susceptibles de modification à tout moment mais sont garantis pour toute réservation confirmée.</p>
      </div>
    </section>`;
}

// ============================================================
// ADMIN - LOGIN & DASHBOARD
// ============================================================
function adminLoginPage() {
  setTimeout(() => {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  }, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Connexion Admin</h2>
      <div class="form-container">
        <form id="login-form">
          <div class="form-group"><label>Nom d'utilisateur</label><input type="text" name="username" required></div>
          <div class="form-group"><label>Mot de passe</label><input type="password" name="password" required></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Se connecter</button>
        </form>
      </div>
    </section>`;
}

async function handleLogin(e) {
  e.preventDefault();
  try {
    const result = await api.login(Object.fromEntries(new FormData(e.target)));
    localStorage.setItem('admin_token', result.token);
    navigateTo('/admin-dashboard');
  } catch { alert('❌ Identifiants incorrects'); }
}

function adminDashboardPage() {
  if (!localStorage.getItem('admin_token')) { navigateTo('/admin-login'); return ''; }
  setTimeout(loadAdminData, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 class="section-title" style="margin: 0;">Dashboard Admin</h2>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" onclick="navigateTo('/admin-portfolio')">🖼️ Portfolio</button>
          <button class="btn btn-primary" onclick="navigateTo('/admin-evenements')">📌 Événements</button>
          <button class="btn btn-outline" onclick="handleLogout()">Déconnexion</button>
          <button class="btn btn-primary" onclick="navigateTo('/admin-calendrier')">📅 Calendrier</button>
        </div>
      </div>
      <div id="admin-content"><p style="text-align: center; color: var(--gray);">Chargement...</p></div>
    </section>`;
}

function handleLogout() {
  localStorage.removeItem('admin_token');
  navigateTo('/admin-login');
}

function adminEventsPage() {
  if (!localStorage.getItem('admin_token')) { navigateTo('/admin-login'); return ''; }
  setTimeout(() => { document.getElementById('event-form')?.addEventListener('submit', saveEvent); loadAdminEvents(); }, 0);
  return `<section class="section" style="padding-top:120px;max-width:1100px;">
    <div class="admin-page-heading"><h2 class="section-title" style="margin:0;">Gestion des événements</h2><button class="btn btn-outline" onclick="navigateTo('/admin-dashboard')">← Dashboard</button></div>
    <div class="admin-events-layout"><div class="form-container" style="margin:0;max-width:none;"><h3 id="event-form-title" style="margin-bottom:1.5rem;color:var(--primary);">Nouvelle publication</h3>
      <form id="event-form"><input type="hidden" name="id" id="event-id"><div class="form-group"><label>Titre *</label><input name="title" required></div><div class="form-group"><label>Date *</label><input type="date" name="event_date" required></div><div class="form-group"><label>Date de fin</label><input type="date" name="end_date"></div><div class="form-group"><label>Lieu</label><input name="location"></div><div class="form-group"><label>Image (URL)</label><input name="image_url" placeholder="https://… ou /assets/uploads/images/…"></div><div class="form-group"><label>Résumé</label><textarea name="excerpt" rows="3"></textarea></div><div class="form-group"><label>Contenu</label><textarea name="content"></textarea></div><label class="pin-control"><input type="checkbox" name="is_pinned"> 📌 Épingler en tête de fil</label><button class="btn btn-primary" style="width:100%;margin-top:1.5rem;">Publier l’événement</button><button type="button" class="btn btn-outline" style="width:100%;margin-top:.75rem;" onclick="resetEventForm()">Annuler l’édition</button></form>
    </div><div><h3 style="margin-bottom:1.5rem;">Publications</h3><div id="admin-events-list"></div></div></div>
  </section>`;
}
let _adminEventsCache = [];
async function loadAdminEvents() {
  const target = document.getElementById('admin-events-list'); if (!target) return;
  try { const events = await api.getEvents(); _adminEventsCache = events; target.innerHTML = events.length ? events.map(event => `<article class="admin-event-row"><div><span>${event.is_pinned ? '📌 ' : ''}${new Date(event.event_date+'T00:00:00').toLocaleDateString('fr-FR')}</span><h4>${event.title}</h4><p>${event.location || 'Sans lieu renseigné'}</p></div><div><button class="btn btn-outline" onclick="editEventById(${event.id})">Modifier</button><button class="btn btn-outline danger" onclick="removeEvent(${event.id})">Supprimer</button></div></article>`).join('') : '<p style="color:var(--gray);">Aucune publication.</p>'; } catch { target.innerHTML='<p>Erreur de chargement.</p>'; }
}
async function saveEvent(e) { e.preventDefault(); const form = e.target; const data=Object.fromEntries(new FormData(form)); data.is_pinned=form.is_pinned.checked; try { if(data.id) await api.updateEvent(data.id,data); else await api.createEvent(data); resetEventForm(); loadAdminEvents(); } catch { alert('Impossible d’enregistrer cet événement.'); } }
function editEvent(event) { const form=document.getElementById('event-form'); Object.entries(event).forEach(([key,value])=> { if(form.elements[key] && key !== 'is_pinned') form.elements[key].value=value || ''; }); form.is_pinned.checked=Boolean(event.is_pinned); document.getElementById('event-form-title').textContent='Modifier la publication'; window.scrollTo({top:0,behavior:'smooth'}); }
function editEventById(id) { const event = _adminEventsCache.find(item => item.id === id); if (event) editEvent(event); }
function resetEventForm() { const form=document.getElementById('event-form'); if(form) form.reset(); const title=document.getElementById('event-form-title'); if(title) title.textContent='Nouvelle publication'; }
async function removeEvent(id) { if(!confirm('Supprimer cet événement ?')) return; try { await api.deleteEvent(id); loadAdminEvents(); } catch { alert('Impossible de supprimer cet événement.'); } }

// ============================================================
// ADMIN - CHARGEMENT DES DONNÉES
// ============================================================
let _allContacts = [];

async function loadAdminData() {
  try {
    const bookings = await api.getAllBookings();
    const contacts = await api.getContacts();
    _allContacts = contacts || [];

    document.getElementById('admin-content').innerHTML = `
      <div style="display: grid; gap: 2rem;">
        <div class="service-card">
          <h3>Réservations Matériel (${bookings.equipment?.length || 0})</h3>
          ${renderBookingsList(bookings.equipment || [], 'equipment')}
        </div>
        <div class="service-card">
          <h3>Réservations Studio (${bookings.studio?.length || 0})</h3>
          ${renderBookingsList(bookings.studio || [], 'studio')}
        </div>
        <div class="service-card">
          <h3>Sessions Enregistrement (${bookings.recording?.length || 0})</h3>
          ${renderBookingsList(bookings.recording || [], 'recording')}
        </div>
        <div class="service-card">
          <h3>Messages de Contact (${_allContacts.length})</h3>
          ${renderContactsList(_allContacts)}
        </div>
      </div>`;
  } catch {
    document.getElementById('admin-content').innerHTML = '<p style="color: var(--primary);">Erreur de chargement</p>';
  }
}

// ============================================================
// ADMIN - RÉSERVATIONS
// ============================================================
function renderBookingsList(bookings, type) {
  if (!bookings || bookings.length === 0) return '<p style="color: var(--gray);">Aucune réservation</p>';

  return bookings.map(b => `
    <div style="padding: 1.5rem; background: var(--dark); border-radius: 10px; margin-top: 1rem; border-left: 4px solid ${getStatusColor(b.status)};">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div>
          <p style="font-size: 1.1rem; font-weight: 600;">${b.name}</p>
          <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.25rem;">📧 ${b.email} | 📞 ${b.phone}</p>
        </div>
        <span style="padding: 0.5rem 1rem; background: ${getStatusColor(b.status)}; border-radius: 20px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
          ${getStatusLabel(b.status)}
        </span>
      </div>
      <div style="background: var(--dark-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        ${renderBookingDetails(b, type)}
      </div>
      ${b.message ? `<div style="padding: 1rem; background: var(--dark-secondary); border-radius: 8px; margin-bottom: 1rem;"><p style="color: var(--gray); font-size: 0.9rem; font-style: italic;">"${b.message}"</p></div>` : ''}
      <p style="color: var(--gray); font-size: 0.85rem; margin-bottom: 1rem;">📅 Reçu le ${new Date(b.created_at).toLocaleString('fr-FR')}</p>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        ${b.status === 'pending' ? `<button onclick="updateBookingStatus(${b.id}, '${type}', 'confirmed')" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">✅ Confirmer</button>` : ''}
        ${b.status === 'confirmed' ? `<button onclick="updateBookingStatus(${b.id}, '${type}', 'completed')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem; border-color: var(--success); color: var(--success);">✓ Terminé</button>` : ''}
        ${b.status !== 'cancelled' ? `<button onclick="updateBookingStatus(${b.id}, '${type}', 'cancelled')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem; border-color: var(--primary); color: var(--primary);">❌ Annuler</button>` : ''}
        <button onclick="window.open('mailto:${b.email}?subject=Votre réservation UntilTheRock', '_blank')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">📧 Email</button>
        <button onclick="deleteBooking(${b.id}, '${type}')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem; border-color: #666; color: #666;">🗑️ Supprimer</button>
      </div>
    </div>`).join('');
}

function renderBookingDetails(b, type) {
  switch (type) {
    case 'equipment': return `<p style="color: var(--light); margin-bottom: 0.5rem;"><strong>🎸 Matériel:</strong> ${b.equipment}</p><p style="color: var(--gray); font-size: 0.9rem;">📅 Du ${new Date(b.start_date).toLocaleDateString('fr-FR')} au ${new Date(b.end_date).toLocaleDateString('fr-FR')}</p>`;
    case 'studio':    return `<p style="color: var(--light); margin-bottom: 0.5rem;"><strong>🎙️ Studio:</strong> ${b.studio_type}</p><p style="color: var(--gray); font-size: 0.9rem;">📅 ${new Date(b.date).toLocaleDateString('fr-FR')} | 🕐 ${b.time_slot} (${b.duration}h)</p>`;
    case 'recording': return `<p style="color: var(--light); margin-bottom: 0.5rem;"><strong>🎵 Projet:</strong> ${b.project_type}</p><p style="color: var(--gray); font-size: 0.9rem;">📅 ${new Date(b.date).toLocaleDateString('fr-FR')} | ⏱️ ${b.duration}h</p>${b.has_demo ? `<button onclick="downloadRecordingDemo(${b.id})" class="btn btn-outline" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;">⬇️ Télécharger la maquette</button>` : ''}`;
    default: return '';
  }
}

function getStatusColor(s) { return { pending: '#ff9800', confirmed: '#2196f3', completed: '#4caf50', cancelled: '#f44336' }[s] || '#666'; }
function getStatusLabel(s) { return { pending: '⏳ En attente', confirmed: '✅ Confirmé', completed: '✓ Terminé', cancelled: '❌ Annulé' }[s] || s; }

async function downloadRecordingDemo(id) {
  try {
    const { blob, filename } = await api.downloadRecordingDemo(id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    alert('❌ Impossible de télécharger la maquette.');
  }
}

async function updateBookingStatus(id, type, newStatus) {
  const msg = { confirmed: 'Confirmer cette réservation ?', completed: 'Marquer comme terminée ?', cancelled: 'Annuler cette réservation ?' };
  if (!confirm(msg[newStatus])) return;
  try {
    await api.updateBookingStatus(type, id, newStatus);
    alert(`✅ Statut mis à jour : ${getStatusLabel(newStatus)}`);
    loadAdminData();
  } catch { alert('❌ Erreur lors de la mise à jour'); }
}

async function deleteBooking(id, type) {
  if (!confirm('Supprimer définitivement cette réservation ?\n\n⚠️ Action irréversible.')) return;
  try {
    await api.deleteBooking(type, id);
    alert('✅ Réservation supprimée !');
    loadAdminData();
  } catch { alert('❌ Erreur lors de la suppression'); }
}

// ============================================================
// ADMIN - MESSAGES CONTACT
// ============================================================
function renderContactsList(contacts) {
  if (!contacts || contacts.length === 0) return '<p style="color: var(--gray);">Aucun message</p>';

  return contacts.map(c => `
    <div style="padding: 1.5rem; background: var(--dark); border-radius: 10px; margin-top: 1rem; border-left: 4px solid ${c.status === 'unread' ? '#ff9800' : '#4caf50'};">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <p style="font-size: 1.1rem; font-weight: 600;">${c.name}</p>
          <p style="color: var(--gray); font-size: 0.9rem; margin-top: 0.25rem;">📧 ${c.email}</p>
        </div>
        <span style="padding: 0.4rem 1rem; background: ${c.status === 'unread' ? '#ff9800' : '#4caf50'}; border-radius: 20px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
          ${c.status === 'unread' ? '📬 Non lu' : '✓ Lu'}
        </span>
      </div>
      <p style="color: var(--primary); font-weight: 600; margin-bottom: 0.75rem;">📌 ${c.subject}</p>
      <div style="padding: 1rem; background: var(--dark-secondary); border-radius: 8px; margin-bottom: 1rem;">
        <p style="color: var(--gray); line-height: 1.6; word-break: break-word;">
          ${c.message.length > 120 ? c.message.substring(0, 120) + '<span style="color: var(--primary);">...</span>' : c.message}
        </p>
        ${c.message.length > 120 ? `<button onclick="openContactModal(${c.id})" style="margin-top: 0.5rem; background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.9rem; padding: 0; text-decoration: underline;">Lire le message complet →</button>` : ''}
      </div>
      <p style="color: var(--gray); font-size: 0.85rem; margin-bottom: 1rem;">📅 Reçu le ${new Date(c.created_at).toLocaleString('fr-FR')}</p>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button onclick="openContactModal(${c.id})" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">👁️ Lire en entier</button>
        ${c.status === 'unread' ? `<button onclick="markContactAsRead(${c.id})" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">✓ Marquer comme lu</button>` : ''}
        <button onclick="window.open('mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}', '_blank')" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">📧 Répondre</button>
      </div>
    </div>`).join('');
}

function openContactModal(contactId) {
  const c = _allContacts.find(m => m.id === contactId);
  if (!c) return;
  document.getElementById('contact-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'contact-modal';
  modal.style.cssText = 'position:fixed;z-index:3000;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:2rem;animation:fadeIn 0.2s ease;';
  modal.innerHTML = `
    <div style="background:var(--dark-secondary);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:2.5rem;max-width:680px;width:100%;max-height:85vh;overflow-y:auto;position:relative;animation:slideUp 0.25s ease;">
      <button onclick="document.getElementById('contact-modal').remove()" style="position:absolute;top:1.25rem;right:1.25rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:var(--light);width:36px;height:36px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;"
        onmouseover="this.style.background='rgba(255,51,102,0.2)';this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
        onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='var(--light)'">×</button>

      <div style="margin-bottom:1.5rem;">
        <span style="display:inline-block;padding:0.4rem 1rem;background:${c.status === 'unread' ? '#ff9800' : '#4caf50'};border-radius:20px;font-size:0.85rem;font-weight:600;">
          ${c.status === 'unread' ? '📬 Non lu' : '✓ Lu'}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;padding:1.25rem;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);">
        <div>
          <p style="color:var(--gray);font-size:0.8rem;margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.5px;">De</p>
          <p style="font-weight:600;font-size:1.05rem;">${c.name}</p>
        </div>
        <div>
          <p style="color:var(--gray);font-size:0.8rem;margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
          <p style="color:var(--primary);word-break:break-all;">${c.email}</p>
        </div>
        <div>
          <p style="color:var(--gray);font-size:0.8rem;margin-bottom:0.25rem;text-transform:uppercase;letter-spacing:0.5px;">Reçu le</p>
          <p style="font-size:0.95rem;">${new Date(c.created_at).toLocaleString('fr-FR')}</p>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <p style="color:var(--gray);font-size:0.8rem;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.5px;">Sujet</p>
        <p style="font-size:1.2rem;font-weight:600;color:var(--primary);">${c.subject}</p>
      </div>

      <div style="padding:1.5rem;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);margin-bottom:2rem;line-height:1.8;white-space:pre-wrap;word-break:break-word;color:var(--light);font-size:1rem;">${c.message}</div>

      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <button onclick="window.open('mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}&body=%0A%0A---%0AMessage original de ${encodeURIComponent(c.name)} :%0A${encodeURIComponent(c.message)}', '_blank')" class="btn btn-primary" style="flex:1;">📧 Répondre à ${c.name}</button>
        ${c.status === 'unread' ? `<button onclick="markContactAsRead(${c.id}); document.getElementById('contact-modal').remove();" class="btn btn-outline" style="flex:1;">✓ Marquer comme lu</button>` : ''}
      </div>
    </div>`;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);

  if (c.status === 'unread') {
    api.updateContactStatus(c.id, 'read').then(() => { c.status = 'read'; }).catch(() => {});
  }
}

async function markContactAsRead(id) {
  try {
    await api.updateContactStatus(id, 'read');
    loadAdminData();
  } catch { alert('❌ Erreur lors de la mise à jour'); }
}

// ============================================================
// ADMIN - PORTFOLIO
// ============================================================
function adminPortfolioPage() {
  if (!localStorage.getItem('admin_token')) { navigateTo('/admin-login'); return ''; }
  setTimeout(() => {
    loadAdminPortfolio();
    document.getElementById('portfolio-add-form')?.addEventListener('submit', handleAddPortfolioWithFiles);
  }, 0);

  return `
    <section class="section" style="padding-top: 120px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2 class="section-title" style="margin: 0;">🖼️ Gestion Portfolio</h2>
        <button class="btn btn-outline" onclick="navigateTo('/admin-dashboard')">← Retour Dashboard</button>
      </div>
      <div class="form-container" style="margin-bottom: 3rem;">
        <h3 style="color: var(--primary); margin-bottom: 1.5rem;">➕ Ajouter un Élément</h3>
        <form id="portfolio-add-form" enctype="multipart/form-data">
          <div class="form-group">
            <label>Type de service (page de destination) *</label>
            <select name="service_type" required>
              <option value="">-- Sélectionnez une page --</option>
              <option value="equipment">🎸 Location de Matériel</option>
              <option value="studio">🎙️ Réservation Studio</option>
              <option value="recording">🎵 Enregistrement / Mix Sessions</option>
            </select>
            <small style="color: var(--gray); display: block; margin-top: 0.5rem;">💡 Un audio ajouté dans « Enregistrement / Mix Sessions » apparaît dans le lecteur Mix Sessions. Vous pouvez le supprimer depuis la liste ci-dessous.</small>
          </div>
          <div class="form-group"><label>Titre *</label><input type="text" name="title" required placeholder="Ex: Projet Rock 2025"></div>
          <div class="form-group"><label>Description</label><textarea name="description" placeholder="Décrivez le projet..." rows="3"></textarea></div>
          <div class="form-group">
            <label>📷 Image</label>
            <div class="file-upload-container">
              <input type="file" name="image" id="image-upload" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onchange="previewFile(this, 'image-preview')">
              <label for="image-upload" class="file-upload-label">📁 Choisir une image</label>
              <div id="image-preview" class="file-preview"></div>
            </div>
            <small style="color: var(--gray); display: block; margin-top: 0.5rem;">Formats acceptés: JPG, PNG, GIF, WEBP — Max 100MB</small>
          </div>
          <div class="form-group">
            <label>🎵 Audio</label>
            <div class="file-upload-container">
              <input type="file" name="audio" id="audio-upload" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg" onchange="previewFile(this, 'audio-preview')">
              <label for="audio-upload" class="file-upload-label">📁 Choisir un fichier audio</label>
              <div id="audio-preview" class="file-preview"></div>
            </div>
            <small style="color: var(--gray); display: block; margin-top: 0.5rem;">Formats acceptés: MP3, WAV, OGG — Max 100MB</small>
          </div>
          <div class="form-group">
            <label>🎬 Vidéo</label>
            <div class="file-upload-container">
              <input type="file" name="video" id="video-upload" accept="video/mp4,video/webm,video/ogg,video/quicktime" onchange="previewFile(this, 'video-preview')">
              <label for="video-upload" class="file-upload-label">📁 Choisir une vidéo</label>
              <div id="video-preview" class="file-preview"></div>
            </div>
            <small style="color: var(--gray); display: block; margin-top: 0.5rem;">Formats acceptés: MP4, WEBM, OGG — Max 100MB</small>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;" id="submit-btn">➕ Ajouter au Portfolio</button>
          <div id="upload-progress" style="display: none; margin-top: 1rem;">
            <div style="background: var(--dark); border-radius: 10px; height: 30px; overflow: hidden;">
              <div id="progress-bar" style="height: 100%; width: 0%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;"></div>
            </div>
          </div>
        </form>
      </div>
      <div class="form-container" style="max-width: 100%;">
        <h3 style="color: var(--primary); margin-bottom: 1.5rem;">📋 Éléments Existants</h3>
        <div id="admin-portfolio-list"><p style="text-align: center; color: var(--gray);">Chargement...</p></div>
      </div>
    </section>`;
}

function previewFile(input, previewId) {
  const preview = document.getElementById(previewId);
  const file = input.files[0];
  if (!file) { preview.innerHTML = ''; return; }
  const size = (file.size / (1024 * 1024)).toFixed(2);
  if (input.accept.includes('image')) {
    const reader = new FileReader();
    reader.onload = e => { preview.innerHTML = `<div style="margin-top:1rem;"><img src="${e.target.result}" style="max-width:200px;max-height:200px;border-radius:10px;object-fit:cover;"><p style="color:var(--gray);font-size:0.9rem;margin-top:0.5rem;">${file.name} (${size} MB)</p></div>`; };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = `<div style="margin-top:1rem;padding:1rem;background:var(--dark);border-radius:10px;"><p style="color:var(--success);">✅ ${file.name}</p><p style="color:var(--gray);font-size:0.9rem;">${size} MB</p></div>`;
  }
}

async function handleAddPortfolioWithFiles(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const progressContainer = document.getElementById('upload-progress');
  const progressBar = document.getElementById('progress-bar');
  btn.disabled = true;
  btn.textContent = '⏳ Upload en cours...';
  progressContainer.style.display = 'block';

  try {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', ev => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        progressBar.style.width = pct + '%';
        progressBar.textContent = pct + '%';
      }
    });
    await new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(`Erreur ${xhr.status}`)));
      xhr.addEventListener('error', () => reject(new Error('Erreur réseau')));
      xhr.open('POST', '/api/portfolio');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('admin_token')}`);
      xhr.send(new FormData(e.target));
    });
    alert('✅ Élément ajouté au portfolio !');
    e.target.reset();
    ['image-preview', 'audio-preview', 'video-preview'].forEach(id => { document.getElementById(id).innerHTML = ''; });
    loadAdminPortfolio();
  } catch (err) {
    alert('❌ Erreur lors de l\'upload. Vérifiez la taille des fichiers (max 100MB).');
  } finally {
    btn.disabled = false;
    btn.textContent = '➕ Ajouter au Portfolio';
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
  }
}

async function loadAdminPortfolio() {
  try {
    renderAdminPortfolio(await api.getPortfolio());
  } catch {
    document.getElementById('admin-portfolio-list').innerHTML = '<p style="color: var(--primary);">Erreur de chargement</p>';
  }
}

function renderAdminPortfolio(items) {
  const list = document.getElementById('admin-portfolio-list');
  if (items.length === 0) { list.innerHTML = '<p style="text-align:center;color:var(--gray);">Aucun élément dans le portfolio</p>'; return; }

  list.innerHTML = `<div style="display:grid;gap:2rem;">${items.map(item => `
    <div class="service-card">
      <div style="display:grid;grid-template-columns:200px 1fr;gap:2rem;align-items:start;">
        <div>
          ${item.image_url
            ? `<div style="position:relative;"><img src="${item.image_url}" style="width:100%;height:150px;object-fit:cover;border-radius:10px;cursor:pointer;" onclick="window.open('${item.image_url}','_blank')"><button onclick="deletePortfolioFile(${item.id},'image')" style="position:absolute;top:5px;right:5px;background:rgba(255,51,102,0.9);border:none;color:white;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1.2rem;">×</button></div>`
            : `<div style="width:100%;height:150px;background:var(--dark);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--gray);">Pas d'image</div>`}
          <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.5rem;">
            ${item.audio_url ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem;background:var(--dark);border-radius:5px;"><span style="color:var(--success);font-size:0.9rem;">🎵 Audio</span><button onclick="deletePortfolioFile(${item.id},'audio')" style="background:transparent;border:none;color:var(--primary);cursor:pointer;font-size:1.2rem;">×</button></div>` : ''}
            ${item.video_url ? `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem;background:var(--dark);border-radius:5px;"><span style="color:var(--success);font-size:0.9rem;">🎬 Vidéo</span><button onclick="deletePortfolioFile(${item.id},'video')" style="background:transparent;border:none;color:var(--primary);cursor:pointer;font-size:1.2rem;">×</button></div>` : ''}
          </div>
        </div>
        <div>
          <h4 style="color:var(--primary);margin-bottom:0.5rem;font-size:1.3rem;">${item.title}</h4>
          <span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);border-radius:20px;font-size:0.85rem;margin-bottom:1rem;">${item.service_type}</span>
          <p style="color:var(--gray);line-height:1.6;margin-bottom:1rem;">${item.description || '<em>Pas de description</em>'}</p>
          <p style="color:var(--gray);font-size:0.85rem;">📅 Ajouté le ${new Date(item.created_at).toLocaleDateString('fr-FR', { year:'numeric', month:'long', day:'numeric' })}</p>
          <div style="margin-top:1.5rem;">
            <button class="btn btn-outline" onclick="deletePortfolioItem(${item.id}, '${item.title}')" style="border-color:var(--primary);color:var(--primary);">🗑️ Supprimer l'élément</button>
          </div>
        </div>
      </div>
    </div>`).join('')}</div>`;
}

async function deletePortfolioFile(id, type) {
  const labels = { image: "l'image", audio: "l'audio", video: "la vidéo" };
  if (!confirm(`Supprimer ${labels[type]} ?`)) return;
  try {
    const r = await fetch(`/api/portfolio/${id}/file/${type}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });
    if (!r.ok) throw new Error();
    alert(`✅ Fichier supprimé !`);
    loadAdminPortfolio();
  } catch { alert('❌ Erreur lors de la suppression.'); }
}

async function deletePortfolioItem(id, title) {
  if (!confirm(`Supprimer "${title}" et tous ses fichiers ?\n\n⚠️ Action irréversible.`)) return;
  try {
    await api.deletePortfolioItem(id);
    alert('✅ Élément supprimé !');
    loadAdminPortfolio();
  } catch { alert('❌ Erreur lors de la suppression.'); }
}

// ============================================================
// PORTFOLIO PUBLIC
// ============================================================
function renderInlinePortfolio(title) {
  return `
    <section class="inline-portfolio" aria-label="${title}">
      <h3 class="inline-portfolio-title">${title}</h3>
      <div id="portfolio-grid" class="services-grid"><p style="text-align:center;color:var(--gray);">Chargement...</p></div>
    </section>`;
}

function portfolioPage() {
  setTimeout(() => loadPortfolioItems('all'), 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Notre Portfolio</h2>
      <div style="text-align: center; margin-bottom: 3rem;">
        <button class="btn btn-outline filter-btn active" onclick="filterPortfolio('all')" data-filter="all" style="margin:0.5rem;">Tout</button>
        <button class="btn btn-outline filter-btn" onclick="filterPortfolio('equipment')" data-filter="equipment" style="margin:0.5rem;">Matériel</button>
        <button class="btn btn-outline filter-btn" onclick="filterPortfolio('studio')" data-filter="studio" style="margin:0.5rem;">Studio</button>
        <button class="btn btn-outline filter-btn" onclick="filterPortfolio('recording')" data-filter="recording" style="margin:0.5rem;">Enregistrement</button>
      </div>
      <div id="portfolio-grid" class="services-grid"><p style="text-align:center;color:var(--gray);">Chargement...</p></div>
    </section>`;
}

function portfolioMaterielPage()    { setTimeout(() => loadPortfolioItems('equipment'), 0); return renderPortfolioTemplate('Portfolio Matériel', 'Découvrez notre matériel en action'); }
function portfolioStudioPage()      { setTimeout(() => loadPortfolioItems('studio'), 0);    return renderPortfolioTemplate('Portfolio Studio', 'Nos studios d\'enregistrement'); }
function portfolioRecordingPage()   { setTimeout(() => loadPortfolioItems('recording'), 0); return renderPortfolioTemplate('Portfolio Enregistrement', 'Nos sessions d\'enregistrement'); }

function renderPortfolioTemplate(title, subtitle) {
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">${title}</h2>
      <p style="text-align:center;color:var(--gray);font-size:1.2rem;margin-bottom:3rem;">${subtitle}</p>
      <div id="portfolio-grid" class="services-grid"><p style="text-align:center;color:var(--gray);">Chargement...</p></div>
      <div style="text-align:center;margin-top:3rem;">
        <button class="btn btn-outline" onclick="navigateTo('/portfolio')">← Voir tout le portfolio</button>
      </div>
    </section>`;
}

async function loadPortfolioItems(filter = 'all') {
  try {
    renderPublicPortfolio(await api.getPortfolio(filter === 'all' ? null : filter));
  } catch {
    document.getElementById('portfolio-grid').innerHTML = '<p style="color:var(--primary);">Erreur de chargement</p>';
  }
}

function renderPublicPortfolio(items) {
  const grid = document.getElementById('portfolio-grid');
  if (items.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:4rem 2rem;"><p style="color:var(--gray);font-size:1.2rem;">Aucune réalisation pour le moment</p></div>`;
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="service-card portfolio-item" style="cursor:pointer;overflow:hidden;">
      ${item.image_url
        ? `<div style="position:relative;overflow:hidden;border-radius:10px;margin-bottom:1rem;height:250px;cursor:zoom-in;" onclick="openPortfolioModal(${item.id})"><img src="${item.image_url}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);padding:0.5rem 1rem;border-radius:20px;font-size:0.85rem;">${getServiceLabel(item.service_type)}</div></div>`
        : `<div style="width:100%;height:250px;background:linear-gradient(135deg,var(--dark-secondary),var(--dark));border-radius:10px;margin-bottom:1rem;"></div>`}
      <h3 style="color:var(--primary);margin-bottom:0.5rem;font-size:1.3rem;">${item.title}</h3>
      <p style="color:var(--gray);margin-bottom:1rem;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${item.description || 'Découvrez ce projet...'}</p>
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
        ${item.image_url ? '<span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);border-radius:15px;font-size:0.75rem;">Image</span>' : ''}
        ${item.audio_url ? '<span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);border-radius:15px;font-size:0.75rem;">Audio</span>' : ''}
        ${item.video_url ? '<span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);border-radius:15px;font-size:0.75rem;">Vidéo</span>' : ''}
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:auto;" onclick="openPortfolioModal(${item.id})">Voir le projet</button>
    </div>`).join('');
}

function getServiceLabel(t) { return { equipment:'Matériel', studio:'Studio', recording:'Enregistrement' }[t] || t; }

function filterPortfolio(type) {
  loadPortfolioItems(type);
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === type);
  });
}

async function openPortfolioModal(itemId) {
  try {
    const items = await api.getPortfolio();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div id="portfolio-modal" class="modal" style="display:flex;" onclick="closePortfolioModal(event)">
        <div class="modal-content" style="max-width:900px;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <span class="modal-close" onclick="closePortfolioModal()">&times;</span>
          <div style="padding:2rem;">
            <div style="margin-bottom:2rem;">
              <span style="display:inline-block;padding:0.5rem 1rem;background:var(--secondary);border-radius:20px;font-size:0.9rem;margin-bottom:1rem;">${getServiceLabel(item.service_type)}</span>
              <h2 style="color:var(--primary);font-size:2rem;margin-bottom:0.5rem;">${item.title}</h2>
              <p style="color:var(--gray);line-height:1.8;font-size:1.1rem;">${item.description || ''}</p>
            </div>
            ${item.image_url ? `<div style="margin-bottom:2rem;"><img src="${item.image_url}" alt="${item.title}" style="width:100%;border-radius:15px;box-shadow:0 10px 40px rgba(0,0,0,0.3);"></div>` : ''}
            ${item.audio_url ? `<div style="margin-bottom:2rem;"><h3 style="color:var(--primary);margin-bottom:1rem;">Extrait audio</h3><audio controls style="width:100%;border-radius:10px;" preload="metadata"><source src="${item.audio_url}" type="audio/mpeg"><source src="${item.audio_url}" type="audio/wav"><source src="${item.audio_url}" type="audio/ogg"></audio></div>` : ''}
            ${item.video_url ? `<div style="margin-bottom:2rem;"><h3 style="color:var(--primary);margin-bottom:1rem;">Vidéo</h3><video controls style="width:100%;border-radius:15px;" preload="metadata"><source src="${item.video_url}" type="video/mp4"><source src="${item.video_url}" type="video/webm"></video></div>` : ''}
            <div style="display:flex;gap:1rem;margin-top:2rem;">
              <button class="btn btn-primary" onclick="navigateTo('/contact')">Nous contacter pour un projet similaire</button>
              <button class="btn btn-outline" onclick="closePortfolioModal()">Fermer</button>
            </div>
          </div>
        </div>
      </div>`);
  } catch { alert('Erreur lors du chargement du projet'); }
}

function closePortfolioModal(event) {
  if (event && event.target.classList.contains('modal-content')) return;
  const modal = document.getElementById('portfolio-modal');
  if (modal && !modal.classList.contains('is-closing')) {
    modal.querySelectorAll('video, audio').forEach(m => m.pause());
    modal.classList.add('is-closing');
    setTimeout(() => modal.remove(), 220);
  }
}

// ============================================================
// CALENDRIER PUBLIC
// ============================================================

// État global du calendrier
let _calState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
  selectedDate: null,
  appointments: [],   // RDV du mois (statuts seulement)
  slots: null         // créneaux du jour sélectionné
};

function calendarPage() {
  setTimeout(initCalendar, 0);
  return `
    <section class="section" style="padding-top: 120px;">
      <h2 class="section-title">Réserver un créneau</h2>
      <p style="text-align: center; color: var(--gray); font-size: 1.1rem; margin-bottom: 3rem;">
        Choisissez une date disponible puis sélectionnez votre créneau horaire.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; max-width: 1100px; margin: 0 auto;">

        <!-- CALENDRIER -->
        <div>
          <!-- Navigation mois -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <button onclick="calPrevMonth()" class="btn btn-outline" style="padding: 0.5rem 1.2rem;">‹</button>
            <h3 id="cal-month-label" style="font-size: 1.4rem; font-weight: 700;"></h3>
            <button onclick="calNextMonth()" class="btn btn-outline" style="padding: 0.5rem 1.2rem;">›</button>
          </div>

          <!-- Grille calendrier -->
          <div id="calendar-grid" style="background: var(--dark-secondary); border-radius: 16px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 0.75rem;">
              ${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d =>
                `<div style="text-align: center; font-size: 0.8rem; color: var(--gray); font-weight: 600; padding: 0.5rem 0;">${d}</div>`
              ).join('')}
            </div>
            <div id="cal-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;"></div>
          </div>

          <!-- Légende -->
          <div style="display: flex; gap: 1.5rem; margin-top: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--gray);">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: var(--success);"></div> Disponible
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--gray);">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #ff9800;"></div> Partiel
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--gray);">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #f44336;"></div> Complet
            </div>
          </div>
        </div>

        <!-- PANNEAU DROITE : créneaux + formulaire -->
        <div id="cal-right-panel">
          <div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem; border: 1px solid rgba(255,255,255,0.08); text-align: center; color: var(--gray);">
            <p>Sélectionnez une date sur le calendrier pour voir les créneaux disponibles.</p>
          </div>
        </div>

      </div>
    </section>
  `;
}

async function initCalendar() {
  await calLoadMonth();
}

async function calLoadMonth() {
  const label = document.getElementById('cal-month-label');
  if (!label) return;

  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  label.textContent = `${months[_calState.month - 1]} ${_calState.year}`;

  try {
    _calState.appointments = await api.getMonthAppointments(_calState.year, _calState.month);
  } catch { _calState.appointments = []; }

  calRenderDays();
}

function calRenderDays() {
  const container = document.getElementById('cal-days');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Premier jour du mois (0=dim, ajuster pour lundi=0)
  const firstDay = new Date(_calState.year, _calState.month - 1, 1);
  let startDow = firstDay.getDay(); // 0=dim
  startDow = startDow === 0 ? 6 : startDow - 1; // convertir en lundi=0

  const daysInMonth = new Date(_calState.year, _calState.month, 0).getDate();
  const TOTAL_SLOTS = 12; // créneaux par jour

  // Construire une map date -> nb de RDV pris
  const takenMap = {};
  _calState.appointments.forEach(a => {
    takenMap[a.date] = (takenMap[a.date] || 0) + 1;
  });

  let html = '';

  // Cases vides avant le 1er
  for (let i = 0; i < startDow; i++) {
    html += `<div></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${_calState.year}-${String(_calState.month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayDate = new Date(_calState.year, _calState.month - 1, d);
    const isPast  = dayDate < today;
    const isToday = dayDate.getTime() === today.getTime();
    const isSel   = _calState.selectedDate === dateStr;
    const taken   = takenMap[dateStr] || 0;
    const free    = TOTAL_SLOTS - taken;

    let dotColor = 'var(--success)';
    if (taken >= TOTAL_SLOTS) dotColor = '#f44336';
    else if (taken >= TOTAL_SLOTS * 0.5) dotColor = '#ff9800';

    const clickable = !isPast && taken < TOTAL_SLOTS;

    html += `
      <div onclick="${clickable ? `calSelectDate('${dateStr}')` : ''}"
        style="
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: ${isToday ? '700' : '400'};
          cursor: ${clickable ? 'pointer' : 'default'};
          background: ${isSel ? 'var(--primary)' : isToday ? 'rgba(255,255,255,0.08)' : 'transparent'};
          color: ${isPast ? 'rgba(255,255,255,0.2)' : 'var(--light)'};
          border: ${isToday && !isSel ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent'};
          transition: all 0.2s ease;
          position: relative;
        "
        onmouseover="${clickable && !isSel ? "this.style.background='rgba(255,255,255,0.1)'" : ''}"
        onmouseout="${clickable && !isSel ? "this.style.background='transparent'" : ''}"
      >
        ${d}
        ${!isPast ? `<div style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor}; margin-top: 2px; opacity: ${taken === 0 ? '0.4' : '1'};"></div>` : ''}
      </div>`;
  }

  container.innerHTML = html;
}

async function calSelectDate(dateStr) {
  _calState.selectedDate = dateStr;
  calRenderDays(); // re-render pour mettre à jour la sélection

  const panel = document.getElementById('cal-right-panel');
  panel.innerHTML = `<div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem; border: 1px solid rgba(255,255,255,0.08); text-align: center; color: var(--gray);"><p>Chargement des créneaux...</p></div>`;

  try {
    const data = await api.getAvailableSlots(dateStr);
    _calState.slots = data;
    calRenderSlotPanel(dateStr, data);
  } catch {
    panel.innerHTML = `<div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem;"><p style="color: var(--primary);">Erreur lors du chargement des créneaux.</p></div>`;
  }
}

function calRenderSlotPanel(dateStr, data) {
  const panel = document.getElementById('cal-right-panel');
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  panel.innerHTML = `
    <div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem; border: 1px solid rgba(255,255,255,0.08);">
      <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.2rem;">${dateLabel}</h3>
      <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 1.5rem;">${data.available.length} créneau(x) disponible(s)</p>

      ${data.available.length === 0 ? `
        <div style="text-align: center; padding: 2rem; color: var(--gray);">
          <p>Aucun créneau disponible ce jour-là.</p>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">Essayez une autre date !</p>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;" id="slot-grid">
          ${data.available.map(slot => `
            <button
              onclick="calSelectSlot('${slot}', this)"
              style="
                padding: 0.75rem 0.5rem;
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                color: var(--light);
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
                transition: all 0.2s ease;
              "
              onmouseover="if(!this.classList.contains('selected-slot')){this.style.borderColor='var(--primary)';this.style.color='var(--primary)';}"
              onmouseout="if(!this.classList.contains('selected-slot')){this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='var(--light)';}"
            >
              ${slot}
            </button>
          `).join('')}
        </div>

        <!-- Formulaire RDV (caché jusqu'à sélection d'un slot) -->
        <div id="rdv-form-container" style="display: none;">
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; margin-top: 0.5rem;">
            <h4 style="color: var(--light); margin-bottom: 1rem; font-size: 1rem;">Vos informations</h4>
            <form id="rdv-form">
              <input type="hidden" name="date" value="${dateStr}">
              <input type="hidden" name="time_slot" id="rdv-slot-input">
              <div class="form-group">
                <label>Nom complet *</label>
                <input type="text" name="name" required>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" name="phone" required>
              </div>
              <div class="form-group">
                <label>Service souhaité *</label>
                <select name="service_type" required>
                  <option value="">Sélectionnez...</option>
                  <option value="studio">Réservation Studio</option>
                  <option value="recording">Session d'Enregistrement</option>
                  <option value="equipment">Location de Matériel</option>
                </select>
              </div>
              <div class="form-group">
                <label>Message (optionnel)</label>
                <textarea name="message" rows="3" placeholder="Décrivez votre projet..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;" id="rdv-submit-btn">
                Confirmer le RDV
              </button>
            </form>
          </div>
        </div>
      `}
    </div>
  `;

  if (data.available.length > 0) {
    document.getElementById('rdv-form')?.addEventListener('submit', handleRdvSubmit);
  }
}

let _selectedSlot = null;

function calSelectSlot(slot, btn) {
  _selectedSlot = slot;

  // Réinitialiser tous les boutons
  document.querySelectorAll('#slot-grid button').forEach(b => {
    b.classList.remove('selected-slot');
    b.style.background = 'rgba(255,255,255,0.05)';
    b.style.borderColor = 'rgba(255,255,255,0.1)';
    b.style.color = 'var(--light)';
  });

  // Mettre en surbrillance le sélectionné
  btn.classList.add('selected-slot');
  btn.style.background = 'var(--primary)';
  btn.style.borderColor = 'var(--primary)';
  btn.style.color = 'white';

  // Mettre à jour le champ caché et afficher le formulaire
  const slotInput = document.getElementById('rdv-slot-input');
  if (slotInput) slotInput.value = slot;

  const formContainer = document.getElementById('rdv-form-container');
  if (formContainer) {
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function handleRdvSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('rdv-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  const data = Object.fromEntries(new FormData(e.target));

  try {
    await api.requestAppointment(data);
    const panel = document.getElementById('cal-right-panel');
    panel.innerHTML = `
      <div style="background: var(--dark-secondary); border-radius: 16px; padding: 3rem 2rem; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <h3 style="color: var(--success); margin-bottom: 1rem;">Demande envoyée !</h3>
        <p style="color: var(--gray); line-height: 1.6; margin-bottom: 1.5rem;">
          Votre demande pour le <strong style="color: var(--light);">${new Date(data.date + 'T00:00:00').toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long'})}</strong>
          à <strong style="color: var(--light);">${data.time_slot}</strong> a bien été reçue.
        </p>
        <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 2rem;">Nous vous confirmerons le rendez-vous par email sous 24h.</p>
        <button class="btn btn-outline" onclick="calSelectDate('${data.date}')">← Choisir un autre créneau</button>
      </div>`;

    // Recharger les données du mois
    await calLoadMonth();
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Confirmer le RDV';
    const msg = err.message?.includes('409') ? 'Ce créneau vient d\'être pris ! Choisissez-en un autre.' : 'Erreur lors de l\'envoi. Réessayez.';
    alert(msg);
  }
}

function calPrevMonth() {
  if (_calState.month === 1) { _calState.month = 12; _calState.year--; }
  else _calState.month--;
  _calState.selectedDate = null;
  document.getElementById('cal-right-panel').innerHTML = `<div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem; text-align: center; color: var(--gray); border: 1px solid rgba(255,255,255,0.08);"><p>Sélectionnez une date.</p></div>`;
  calLoadMonth();
}

function calNextMonth() {
  if (_calState.month === 12) { _calState.month = 1; _calState.year++; }
  else _calState.month++;
  _calState.selectedDate = null;
  document.getElementById('cal-right-panel').innerHTML = `<div style="background: var(--dark-secondary); border-radius: 16px; padding: 2rem; text-align: center; color: var(--gray); border: 1px solid rgba(255,255,255,0.08);"><p>Sélectionnez une date.</p></div>`;
  calLoadMonth();
}

// ============================================================
// CALENDRIER ADMIN
// ============================================================

let _adminCalState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  allAppointments: []
};

function adminCalendarPage() {
  if (!localStorage.getItem('admin_token')) { navigateTo('/admin-login'); return ''; }
  setTimeout(initAdminCalendar, 0);

  return `
    <section class="section" style="padding-top: 120px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <h2 class="section-title" style="margin: 0;">📅 Gestion Calendrier</h2>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" onclick="openBlockModal()">🔒 Bloquer un créneau</button>
          <button class="btn btn-outline" onclick="navigateTo('/admin-dashboard')">← Dashboard</button>
        </div>
      </div>

      <!-- Vue Mois Admin -->
      <div style="display: grid; grid-template-columns: 400px 1fr; gap: 2rem; align-items: start;">

        <!-- Calendrier Admin -->
        <div class="service-card" style="cursor: default;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <button onclick="adminCalPrevMonth()" class="btn btn-outline" style="padding: 0.4rem 1rem;">‹</button>
            <h3 id="admin-cal-label" style="font-size: 1.2rem; font-weight: 700;"></h3>
            <button onclick="adminCalNextMonth()" class="btn btn-outline" style="padding: 0.4rem 1rem;">›</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 0.5rem;">
            ${['L','M','M','J','V','S','D'].map(d => `<div style="text-align:center;font-size:0.75rem;color:var(--gray);padding:0.3rem 0;font-weight:600;">${d}</div>`).join('')}
          </div>
          <div id="admin-cal-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px;"></div>
        </div>

        <!-- Liste des RDV du jour sélectionné -->
        <div id="admin-day-panel">
          <div class="service-card" style="text-align: center; color: var(--gray); cursor: default;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👈</div>
            <p>Cliquez sur un jour pour voir les rendez-vous.</p>
          </div>
        </div>
      </div>

      <!-- Liste complète (à venir / en attente) -->
      <div class="service-card" style="margin-top: 2rem; cursor: default;">
        <h3 style="color: var(--primary); margin-bottom: 1.5rem;">⏳ Demandes en attente de confirmation</h3>
        <div id="admin-pending-list"><p style="color: var(--gray);">Chargement...</p></div>
      </div>
    </section>

    <!-- Modal blocage -->
    <div id="block-modal" style="display:none;position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;padding:2rem;">
      <div style="background:var(--dark-secondary);border-radius:16px;padding:2.5rem;max-width:500px;width:100%;border:1px solid rgba(255,255,255,0.1);position:relative;">
        <button onclick="closeBlockModal()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;color:var(--gray);font-size:1.5rem;cursor:pointer;">×</button>
        <h3 style="color:var(--primary);margin-bottom:1.5rem;">🔒 Bloquer un créneau</h3>
        <form id="block-form">
          <div class="form-group">
            <label>Date *</label>
            <input type="date" name="date" required>
          </div>
          <div class="form-group">
            <label>Créneau horaire *</label>
            <select name="time_slot" required>
              ${['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
                .map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Raison</label>
            <input type="text" name="reason" placeholder="Ex: Maintenance, Événement privé...">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">🔒 Bloquer ce créneau</button>
        </form>
      </div>
    </div>
  `;
}

async function initAdminCalendar() {
  await adminCalLoad();
}

async function adminCalLoad() {
  const label = document.getElementById('admin-cal-label');
  if (!label) return;
  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  label.textContent = `${months[_adminCalState.month - 1]} ${_adminCalState.year}`;

  try {
    _adminCalState.allAppointments = await api.getAllAppointments();
  } catch { _adminCalState.allAppointments = []; }

  adminCalRenderDays();
  adminRenderPendingList();

  // Gestion du formulaire de blocage
  document.getElementById('block-form')?.addEventListener('submit', handleBlockSlot);
}

function adminCalRenderDays() {
  const container = document.getElementById('admin-cal-days');
  if (!container) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const firstDay = new Date(_adminCalState.year, _adminCalState.month - 1, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(_adminCalState.year, _adminCalState.month, 0).getDate();

  // Map date -> tableau de RDV
  const dayMap = {};
  _adminCalState.allAppointments.forEach(a => {
    if (!a.date.startsWith(`${_adminCalState.year}-${String(_adminCalState.month).padStart(2,'0')}`)) return;
    if (!dayMap[a.date]) dayMap[a.date] = [];
    dayMap[a.date].push(a);
  });

  let html = '';
  for (let i = 0; i < startDow; i++) html += '<div></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${_adminCalState.year}-${String(_adminCalState.month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayDate = new Date(_adminCalState.year, _adminCalState.month - 1, d);
    const isPast  = dayDate < today;
    const isToday = dayDate.getTime() === today.getTime();
    const rdvs    = dayMap[dateStr] || [];
    const pending = rdvs.filter(r => r.status === 'pending').length;
    const confirmed = rdvs.filter(r => r.status === 'confirmed').length;

    let indicator = '';
    if (pending > 0)   indicator = `<div style="width:8px;height:8px;border-radius:50%;background:#ff9800;margin-top:2px;"></div>`;
    else if (confirmed > 0) indicator = `<div style="width:8px;height:8px;border-radius:50%;background:var(--success);margin-top:2px;"></div>`;

    html += `
      <div onclick="adminSelectDay('${dateStr}')"
        style="
          aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
          border-radius:8px;font-size:0.9rem;cursor:pointer;
          color:${isPast?'rgba(255,255,255,0.3)':'var(--light)'};
          background:${isToday?'rgba(255,255,255,0.08)':'transparent'};
          border:${isToday?'2px solid rgba(255,255,255,0.3)':'2px solid transparent'};
          transition:all 0.2s ease;font-weight:${isToday?'700':'400'};
        "
        onmouseover="this.style.background='rgba(255,255,255,0.1)'"
        onmouseout="this.style.background='${isToday?'rgba(255,255,255,0.08)':'transparent'}'"
      >
        ${d}
        ${indicator}
      </div>`;
  }

  container.innerHTML = html;
}

async function adminSelectDay(dateStr) {
  const panel = document.getElementById('admin-day-panel');
  const rdvs = _adminCalState.allAppointments.filter(a => a.date === dateStr);
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });

  const SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

  const rdvMap = {};
  rdvs.forEach(r => { rdvMap[r.time_slot] = r; });

  panel.innerHTML = `
    <div class="service-card" style="cursor: default;">
      <h3 style="color: var(--primary); margin-bottom: 1.5rem; text-transform: capitalize;">📅 ${dateLabel}</h3>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${SLOTS.map(slot => {
          const rdv = rdvMap[slot];
          if (!rdv) {
            return `
              <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem 1rem;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
                <span style="font-weight:700;color:var(--gray);min-width:55px;">${slot}</span>
                <span style="color:var(--success);font-size:0.9rem;">✓ Libre</span>
                <button onclick="quickBlock('${dateStr}','${slot}')" style="margin-left:auto;background:none;border:1px solid rgba(255,255,255,0.1);color:var(--gray);padding:0.3rem 0.75rem;border-radius:8px;cursor:pointer;font-size:0.8rem;" onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='var(--gray)'">🔒 Bloquer</button>
              </div>`;
          }

          const isBlocked = rdv.service_type === 'blocked';
          const colors = { pending:'#ff9800', confirmed:'var(--success)', cancelled:'#f44336' };
          const labels = { pending:'⏳ En attente', confirmed:'✅ Confirmé', cancelled:'❌ Annulé' };

          return `
            <div style="padding:1rem;background:var(--dark);border-radius:10px;border-left:4px solid ${colors[rdv.status]||'#666'};">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:${isBlocked?'0':'0.75rem'};">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <span style="font-weight:700;color:var(--primary);min-width:55px;">${slot}</span>
                  <span style="font-size:0.85rem;padding:0.25rem 0.75rem;background:${colors[rdv.status]||'#666'};border-radius:20px;font-weight:600;">${labels[rdv.status]||rdv.status}</span>
                  ${isBlocked ? `<span style="color:var(--gray);font-size:0.9rem;">🔒 ${rdv.message||'Bloqué'}</span>` : ''}
                </div>
                <button onclick="adminDeleteAppointment(${rdv.id})" style="background:none;border:1px solid rgba(255,51,102,0.3);color:var(--primary);padding:0.3rem 0.75rem;border-radius:8px;cursor:pointer;font-size:0.8rem;">🗑️</button>
              </div>
              ${!isBlocked ? `
                <p style="font-weight:600;margin-bottom:0.25rem;">${rdv.name}</p>
                <p style="color:var(--gray);font-size:0.9rem;">📧 ${rdv.email} | 📞 ${rdv.phone}</p>
                <p style="color:var(--gray);font-size:0.9rem;margin-top:0.25rem;">Service: ${getServiceLabel(rdv.service_type)}</p>
                ${rdv.message ? `<p style="color:var(--gray);font-size:0.9rem;margin-top:0.25rem;font-style:italic;">"${rdv.message}"</p>` : ''}
                <div style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap;">
                  ${rdv.status === 'pending' ? `<button onclick="adminUpdateAppt(${rdv.id},'confirmed','${dateStr}')" class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem;">✅ Confirmer</button>` : ''}
                  ${rdv.status !== 'cancelled' ? `<button onclick="adminUpdateAppt(${rdv.id},'cancelled','${dateStr}')" class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem;border-color:var(--primary);color:var(--primary);">❌ Annuler</button>` : ''}
                  <button onclick="window.open('mailto:${rdv.email}?subject=Votre RDV UntilTheRock', '_blank')" class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem;">📧 Email</button>
                </div>
              ` : ''}
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function adminRenderPendingList() {
  const container = document.getElementById('admin-pending-list');
  if (!container) return;

  const pending = _adminCalState.allAppointments
    .filter(a => a.status === 'pending' && a.service_type !== 'blocked')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (pending.length === 0) {
    container.innerHTML = '<p style="color: var(--gray);">Aucune demande en attente. 🎉</p>';
    return;
  }

  container.innerHTML = pending.map(rdv => {
    const dateLabel = new Date(rdv.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    return `
      <div style="padding:1.25rem;background:var(--dark);border-radius:10px;margin-bottom:1rem;border-left:4px solid #ff9800;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <div>
          <p style="font-weight:600;margin-bottom:0.25rem;">${rdv.name} <span style="color:var(--gray);font-weight:400;font-size:0.9rem;">— ${rdv.email}</span></p>
          <p style="color:var(--primary);font-size:0.95rem;">📅 ${dateLabel} à ${rdv.time_slot}</p>
          <p style="color:var(--gray);font-size:0.9rem;">${getServiceLabel(rdv.service_type)} | 📞 ${rdv.phone}</p>
          ${rdv.message ? `<p style="color:var(--gray);font-size:0.85rem;font-style:italic;margin-top:0.25rem;">"${rdv.message}"</p>` : ''}
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button onclick="adminUpdateAppt(${rdv.id},'confirmed',null)" class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.9rem;">✅ Confirmer</button>
          <button onclick="adminUpdateAppt(${rdv.id},'cancelled',null)" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.9rem;border-color:var(--primary);color:var(--primary);">❌ Refuser</button>
          <button onclick="window.open('mailto:${rdv.email}?subject=Votre RDV UntilTheRock', '_blank')" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.9rem;">📧</button>
        </div>
      </div>`;
  }).join('');
}

async function adminUpdateAppt(id, status, dateStr) {
  try {
    await api.updateAppointmentStatus(id, status);
    _adminCalState.allAppointments = await api.getAllAppointments();
    adminCalRenderDays();
    adminRenderPendingList();
    if (dateStr) adminSelectDay(dateStr);
    alert(`✅ Rendez-vous ${status === 'confirmed' ? 'confirmé' : 'annulé'} !`);
  } catch { alert('❌ Erreur lors de la mise à jour'); }
}

async function adminDeleteAppointment(id) {
  if (!confirm('Supprimer définitivement ce rendez-vous ?')) return;
  try {
    await api.deleteAppointment(id);
    _adminCalState.allAppointments = await api.getAllAppointments();
    adminCalRenderDays();
    adminRenderPendingList();
    alert('✅ Rendez-vous supprimé');
  } catch { alert('❌ Erreur lors de la suppression'); }
}

function adminCalPrevMonth() {
  if (_adminCalState.month === 1) { _adminCalState.month = 12; _adminCalState.year--; }
  else _adminCalState.month--;
  adminCalLoad();
}

function adminCalNextMonth() {
  if (_adminCalState.month === 12) { _adminCalState.month = 1; _adminCalState.year++; }
  else _adminCalState.month++;
  adminCalLoad();
}

function openBlockModal() {
  document.getElementById('block-modal').style.display = 'flex';
}

function closeBlockModal() {
  document.getElementById('block-modal').style.display = 'none';
}

async function quickBlock(date, slot) {
  if (!confirm(`Bloquer le créneau ${slot} du ${date} ?`)) return;
  try {
    await api.blockSlot({ date, time_slot: slot, reason: 'Indisponible' });
    _adminCalState.allAppointments = await api.getAllAppointments();
    adminCalRenderDays();
    adminSelectDay(date);
  } catch { alert('❌ Erreur lors du blocage'); }
}

async function handleBlockSlot(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api.blockSlot(data);
    alert(`✅ Créneau ${data.time_slot} du ${data.date} bloqué !`);
    closeBlockModal();
    e.target.reset();
    _adminCalState.allAppointments = await api.getAllAppointments();
    adminCalRenderDays();
    adminRenderPendingList();
  } catch { alert('❌ Erreur lors du blocage'); }
}
