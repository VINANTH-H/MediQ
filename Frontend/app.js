/* BookMyDoc — Application Logic (app.js) */

// ===================== GLOBAL STATE =====================
const state = {
  currentRole: 'patient',
  activeView: 'patient-ai-chat',
  conversationId: 'conv_' + Math.random().toString(36).substring(2, 9),

  slots: { symptom: null, specialty: null, date: null, time: null, doctorId: null, selectedDoctor: null },
  bookingStatus: 'collecting_information',

  // Approved Doctors
  doctors: [
    { id: 'doc1', name: 'Dr. Swathi Deshmukh', specialization: 'Orthopedic',      hospital: 'Apollo Hospital',   experience: 12, availableTime: '17:00 - 20:00', fee: 600, status: 'approved', about: 'Dr. Swathi is a senior orthopedic specialist with over 12 years of experience in joint replacement and spine surgery.' },
    { id: 'doc2', name: 'Dr. Kamal Joshi',     specialization: 'Orthopedic',      hospital: 'Narayana Hospital', experience: 8,  availableTime: '09:00 - 12:00', fee: 500, status: 'approved', about: 'Expert in sports injuries and minimally invasive orthopedic procedures.' },
    { id: 'doc3', name: 'Dr. Rajesh Sharma',   specialization: 'ENT Specialist',  hospital: 'Apollo Hospital',   experience: 15, availableTime: '09:00 - 12:00', fee: 700, status: 'approved', about: 'Dr. Rajesh is a 15-year veteran in ENT with specialization in sinus surgery and hearing restoration.' },
    { id: 'doc4', name: 'Dr. Suresh Gupta',    specialization: 'ENT Specialist',  hospital: 'City Care Hospital',experience: 10, availableTime: '10:00 - 13:00', fee: 550, status: 'approved', about: 'Experienced in pediatric ENT and advanced cochlear implant procedures.' },
    { id: 'doc5', name: 'Dr. Ananya Roy',       specialization: 'Cardiologist',    hospital: 'Fortis Health',     experience: 14, availableTime: '11:00 - 15:00', fee: 900, status: 'approved', about: 'Dr. Ananya specializes in interventional cardiology and heart failure management.' },
    { id: 'doc6', name: 'Dr. Vikram Patel',     specialization: 'Dermatologist',   hospital: 'Max Healthcare',    experience: 9,  availableTime: '14:00 - 17:00', fee: 500, status: 'approved', about: 'Expert dermatologist handling acne, eczema, hair disorders, and cosmetic procedures.' },
    { id: 'doc7', name: 'Dr. Meera Nambiar',    specialization: 'General Physician',hospital: 'Care Clinic',      experience: 11, availableTime: '09:00 - 14:00', fee: 350, status: 'approved', about: 'Primary care doctor with expertise in managing fever, infections, diabetes, and hypertension.' }
  ],

  // Pending Doctor Approvals
  pendingDoctors: [
    { id: 'pend1', name: 'Dr. Pooja Mehta',    specialization: 'Neurologist',    hospital: 'Medanta Hospital',  experience: 7,  fee: 800, registeredAt: '2026-08-19 11:30 AM' },
    { id: 'pend2', name: 'Dr. Arjun Sinha',    specialization: 'Pediatrician',   hospital: 'Rainbow Hospital',  experience: 5,  fee: 400, registeredAt: '2026-08-19 02:15 PM' },
    { id: 'pend3', name: 'Dr. Farida Khan',    specialization: 'Cardiologist',   hospital: 'Fortis Health',     experience: 9,  fee: 850, registeredAt: '2026-08-19 04:00 PM' }
  ],

  // Knowledge Base Rules (RAG)
  knowledgeBase: [
    { id: 'kb1', title: 'Orthopedic Guidance',        category: 'Orthopedic',       content: 'Treats bone, joint, ligament, and spine conditions.',        keywords: ['knee pain', 'joint pain', 'fracture', 'back pain'] },
    { id: 'kb2', title: 'Cardiologist Guidance',      category: 'Cardiologist',     content: 'Cardiovascular health and hypertension management.',          keywords: ['chest pain', 'high blood pressure', 'heart problem', 'palpitation'] },
    { id: 'kb3', title: 'Dermatologist Guidance',     category: 'Dermatologist',    content: 'Skin, hair, nail treatments and allergic reactions.',         keywords: ['skin rash', 'acne', 'eczema', 'hair loss', 'allergy'] },
    { id: 'kb4', title: 'ENT Guidance',               category: 'ENT Specialist',   content: 'Ear, Nose, Throat, and head/neck disorders.',                keywords: ['ear pain', 'throat infection', 'nose blockage', 'sinus', 'tooth pain'] },
    { id: 'kb5', title: 'General Physician Guidance', category: 'General Physician',content: 'Primary care, fever, cold, flu, and general health.',         keywords: ['fever', 'cold', 'cough', 'headache', 'body ache', 'flu'] }
  ],

  // Appointments
  appointments: [
    { id: 'APT-1001', patientName: 'Rahul Sharma',  patientPhone: '+91 9876543210', doctorId: 'doc3', doctorName: 'Dr. Rajesh Sharma',   specialty: 'ENT Specialist',   date: '2026-08-20', time: '09:00 - 12:00', symptom: 'Severe ear pain & sinus', status: 'booked' },
    { id: 'APT-1002', patientName: 'Priya Singh',   patientPhone: '+91 9123456789', doctorId: 'doc1', doctorName: 'Dr. Swathi Deshmukh', specialty: 'Orthopedic',       date: '2026-08-19', time: '17:00 - 20:00', symptom: 'Joint fracture checkup', status: 'completed' }
  ],

  // Weekly chart data
  weeklyData: [3, 5, 7, 4, 6, 8, 2]
};

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarNav();
  renderDoctorCatalog();
  renderAllTables();
  renderAdminDashboard();
  renderDoctorDashboard();
  renderWeeklyChart();
});

// ===================== ROLE SWITCHER =====================
function switchRole(role, event) {
  state.currentRole = role;

  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');

  const badge    = document.getElementById('role-badge');
  const avatar   = document.getElementById('user-avatar');
  const userName = document.getElementById('user-display-name');
  const userRole = document.getElementById('user-display-role');

  if (role === 'patient') {
    badge.className = 'role-badge-indicator badge-patient';
    badge.innerHTML = '<span class="status-dot dot-green"></span> Patient POV';
    avatar.innerText = 'P';
    userName.innerText = 'Rahul Sharma';
    userRole.innerText = 'Patient Account';
    state.activeView = 'patient-ai-chat';
  } else if (role === 'doctor') {
    badge.className = 'role-badge-indicator badge-doctor';
    badge.innerHTML = '<span class="status-dot dot-green"></span> Doctor POV';
    avatar.innerText = 'D';
    userName.innerText = 'Dr. Rajesh Sharma';
    userRole.innerText = 'ENT Specialist';
    state.activeView = 'doctor-dashboard';
  } else if (role === 'admin') {
    badge.className = 'role-badge-indicator badge-admin';
    badge.innerHTML = '<span class="status-dot dot-green"></span> Admin POV';
    avatar.innerText = 'A';
    userName.innerText = 'System Admin';
    userRole.innerText = 'Administrator';
    state.activeView = 'admin-dashboard';
  }

  renderSidebarNav();
  switchView(state.activeView, null);
  showToast(`Switched to ${role.charAt(0).toUpperCase() + role.slice(1)} view`);
}

// ===================== SIDEBAR NAV =====================
function renderSidebarNav() {
  const container = document.getElementById('sidebar-nav');
  let html = '';

  if (state.currentRole === 'patient') {
    html = `
      <div class="nav-section-title">Patient Portal</div>
      <a class="nav-item active" onclick="switchView('patient-ai-chat', this)">
        <i class="ri-robot-2-line"></i> AI Health Assistant
      </a>
      <a class="nav-item" onclick="switchView('patient-find-doctors', this)">
        <i class="ri-search-2-line"></i> Find Doctors
      </a>
      <a class="nav-item" onclick="switchView('patient-appointments', this)">
        <i class="ri-calendar-check-line"></i> My Appointments
      </a>
    `;
  } else if (state.currentRole === 'doctor') {
    html = `
      <div class="nav-section-title">Doctor Portal</div>
      <a class="nav-item active" onclick="switchView('doctor-dashboard', this)">
        <i class="ri-dashboard-3-line"></i> Dashboard
      </a>
      <a class="nav-item" onclick="switchView('doctor-schedule', this)">
        <i class="ri-calendar-event-line"></i> My Schedule
      </a>
      <a class="nav-item" onclick="switchView('doctor-slots', this)">
        <i class="ri-settings-4-line"></i> Availability
      </a>
    `;
  } else if (state.currentRole === 'admin') {
    html = `
      <div class="nav-section-title">Admin Controls</div>
      <a class="nav-item active" onclick="switchView('admin-dashboard', this)">
        <i class="ri-dashboard-3-line"></i> Overview
      </a>
      <a class="nav-item" onclick="switchView('admin-doctors', this)">
        <i class="ri-user-md-line"></i> Doctor Management
      </a>
      <a class="nav-item" onclick="switchView('admin-kb', this)">
        <i class="ri-brain-line"></i> RAG Knowledge Base
      </a>
      <a class="nav-item" onclick="switchView('admin-appointments', this)">
        <i class="ri-file-list-3-line"></i> Appointments
      </a>
    `;
  }
  container.innerHTML = html;
}

// ===================== VIEW SWITCHER =====================
function switchView(viewId, el = null) {
  state.activeView = viewId;
  if (el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
  }
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

// ===================== RAG CHAT LOGIC =====================
async function sendChatMessage() {
  const input = document.getElementById('chat-user-input');
  const text  = input.value.trim();
  if (!text) return;
  appendChat(text, 'user');
  input.value = '';

  // Try live backend; fallback to client simulation
  try {
    const res = await fetch('http://localhost:5000/api/rag/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: state.conversationId, message: text })
    });
    if (res.ok) {
      const data = await res.json();
      appendChat(data.message, 'ai');
      if (data.state && data.state.slots) updateSlotUI(data.state.slots, data.status);
      return;
    }
  } catch (_) {
    console.warn('Backend offline — running client-side RAG simulation.');
  }

  simulateRAG(text);
}

function appendChat(text, role) {
  const list = document.getElementById('chat-messages-list');
  const div  = document.createElement('div');
  div.className = `message-bubble message-${role}`;
  if (role === 'ai') {
    div.innerHTML = `<div class="ai-meta-tag"><i class="ri-sparkling-2-line"></i> RAG AI Engine</div>${text}`;
  } else {
    div.innerText = text;
  }
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

// Renders raw HTML inside an AI chat bubble (used for interactive booking cards)
function appendChatHTML(html) {
  const list = document.getElementById('chat-messages-list');
  const div  = document.createElement('div');
  div.className = 'message-bubble message-ai';
  div.innerHTML = `<div class="ai-meta-tag"><i class="ri-sparkling-2-line"></i> RAG AI Engine</div>${html}`;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

// Called when user clicks "Book Now" inline inside chat — opens pre-filled confirmation form
let _pendingChatDocId = null;

function chatSelectDoctor(docId) {
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) return;
  _pendingChatDocId = docId;

  // Pre-fill the chat booking modal
  document.getElementById('cb-patient-name').value = 'Rahul Sharma';
  document.getElementById('cb-doctor-name').value  = doc.name;
  document.getElementById('cb-spec').value          = doc.specialization;
  document.getElementById('cb-date').value          = state.slots.date || getTomorrow();
  document.getElementById('cb-symptom').value       = state.slots.symptom || 'General Consultation';
  document.getElementById('cb-notes').value         = '';

  // Pre-select time slot if already captured
  const timeEl = document.getElementById('cb-time');
  if (state.slots.time) {
    [...timeEl.options].forEach(o => { if (o.value === state.slots.time) o.selected = true; });
  }

  openModal('modal-chat-booking');
}

function confirmChatBooking() {
  const doc  = state.doctors.find(d => d.id === _pendingChatDocId);
  if (!doc) return;

  const date = document.getElementById('cb-date').value;
  const time = document.getElementById('cb-time').value;
  if (!date) { showToast('Please select a date'); return; }

  state.slots.doctorId      = doc.id;
  state.slots.selectedDoctor = doc.name;
  state.slots.date          = date;
  state.slots.time          = time;
  state.bookingStatus       = 'appointment_confirmed';

  const booking = {
    id: 'APT-' + Math.floor(1000 + Math.random() * 9000),
    patientName: 'Rahul Sharma',
    patientPhone: '+91 9876543210',
    doctorId: doc.id,
    doctorName: doc.name,
    specialty: doc.specialization,
    date, time,
    symptom: state.slots.symptom || 'General Consultation',
    status: 'booked'
  };

  state.appointments.push(booking);
  closeModal('modal-chat-booking');
  renderAllTables();
  renderDoctorDashboard();
  renderAdminDashboard();

  appendChat(
    `✅ Appointment confirmed with <b>${doc.name}</b> (${doc.specialization}) on <b>${date}</b> at <b>${time}</b>.<br>Booking Ref: <code>#${booking.id}</code>`,
    'ai'
  );
  updateSlotUI(state.slots, state.bookingStatus);
  showToast(`Appointment booked with ${doc.name}!`);
  _pendingChatDocId = null;
}

function simulateRAG(message) {
  const lowerMsg = message.toLowerCase();

  // Doctor selection phase
  if (state.bookingStatus === 'ready_for_doctor_search') {
    const approved = state.doctors.filter(d => d.status === 'approved' && d.specialization === state.slots.specialty);
    const match = approved.find(d =>
      d.name.toLowerCase().split(' ').some(p => lowerMsg.includes(p))
    );
    if (match) {
      state.slots.doctorId = match.id;
      state.slots.selectedDoctor = match.name;
      state.bookingStatus = 'appointment_confirmed';

      const booking = {
        id: 'APT-' + Math.floor(1000 + Math.random() * 9000),
        patientName: 'Rahul Sharma',
        patientPhone: '+91 9876543210',
        doctorId: match.id,
        doctorName: match.name,
        specialty: state.slots.specialty,
        date: state.slots.date || '2026-08-21',
        time: state.slots.time || '09:00 - 12:00',
        symptom: state.slots.symptom || 'General Consultation',
        status: 'booked'
      };
      state.appointments.push(booking);
      renderAllTables();
      renderDoctorDashboard();
      renderAdminDashboard();

      appendChat(`✅ Appointment confirmed with <b>${match.name}</b> (${state.slots.specialty}) on <b>${booking.date}</b> at <b>${booking.time}</b>.<br><br>Booking Ref: <code>#${booking.id}</code>`, 'ai');
      updateSlotUI(state.slots, state.bookingStatus);
      showToast('Appointment confirmed!');
      return;
    }
    appendChat("I didn't catch that name. Could you type the doctor's name from the list above?", 'ai');
    return;
  }

  // Symptom & slot extraction
  let matched = null;
  for (const rule of state.knowledgeBase) {
    if (rule.keywords.some(kw => lowerMsg.includes(kw))) { matched = rule; break; }
  }

  if (matched) {
    state.slots.symptom  = matched.keywords.find(kw => lowerMsg.includes(kw)) || 'Reported Symptom';
    state.slots.specialty = matched.category;
    const ragEl = document.getElementById('rag-matched-rule');
    if (ragEl) ragEl.innerHTML = `<span class="status-dot dot-green"></span> Matched: <b>${matched.category}</b>`;
  }

  // Date/time extraction
  if (lowerMsg.includes('tomorrow'))   state.slots.date = getTomorrow();
  else if (lowerMsg.includes('today')) state.slots.date = getToday();
  else if (!state.slots.date)          state.slots.date = getTomorrow();

  if (lowerMsg.includes('morning') || lowerMsg.includes('10 am') || lowerMsg.includes('09')) {
    state.slots.time = '09:00 - 12:00';
  } else if (lowerMsg.includes('evening') || lowerMsg.includes('5 pm') || lowerMsg.includes('17')) {
    state.slots.time = '17:00 - 20:00';
  } else if (!state.slots.time) {
    state.slots.time = '09:00 - 12:00';
  }

  const availDocs = state.doctors.filter(d => d.status === 'approved' && d.specialization === (state.slots.specialty || 'General Physician'));

  if (state.slots.symptom && state.slots.specialty && availDocs.length > 0) {
    state.bookingStatus = 'ready_for_doctor_search';

    // Build inline doctor option cards with Book buttons
    const docCards = availDocs.map(d => `
      <div class="chat-doctor-option">
        <div>
          <div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">${d.name}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${d.hospital} &nbsp;·&nbsp; ${d.availableTime} &nbsp;·&nbsp; ₹${d.fee}</div>
        </div>
        <button class="chat-book-btn" onclick="chatSelectDoctor('${d.id}')">Book Now</button>
      </div>
    `).join('');

    const aiHtml = `Based on your symptoms, our RAG engine matched you with an <b>${state.slots.specialty}</b>.<br>
      Available on <b>${state.slots.date}</b> at <b>${state.slots.time}</b>:
      ${docCards}`;

    appendChatHTML(aiHtml);
  } else if (matched && availDocs.length === 0) {
    appendChat(`We found a match for <b>${matched.category}</b>, but unfortunately no doctors of that specialty are available right now. Please try again later.`, 'ai');
  } else {
    appendChat(`Could you describe your symptoms in a bit more detail? For example: <i>"I have severe back pain and need an appointment this Friday morning."</i>`, 'ai');
  }

  updateSlotUI(state.slots, state.bookingStatus);
}

function updateSlotUI(slots, status) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = val || '—';
    el.className = val ? 'slot-value' : 'slot-value empty';
  };
  set('slot-symptom',  slots.symptom);
  set('slot-specialty', slots.specialty);
  set('slot-date',     slots.date);
  set('slot-time',     slots.time);
  set('slot-doctor',   slots.selectedDoctor || (slots.doctorId ? 'ID: ' + slots.doctorId : null));

  const badge = document.getElementById('booking-status-badge');
  if (!badge) return;
  badge.innerText = status || 'collecting_information';
  badge.className = 'badge ' + (
    status === 'appointment_confirmed' ? 'badge-completed' :
    status === 'ready_for_doctor_search' ? 'badge-booked' : 'badge-pending'
  );
  badge.style.cssText = 'font-size:0.82rem;padding:7px 12px;width:100%;justify-content:center;';
}

function resetChat() {
  state.slots = { symptom: null, specialty: null, date: null, time: null, doctorId: null, selectedDoctor: null };
  state.bookingStatus = 'collecting_information';
  state.conversationId = 'conv_' + Math.random().toString(36).substring(2, 9);
  document.getElementById('chat-messages-list').innerHTML = `
    <div class="message-bubble message-ai">
      <div class="ai-meta-tag"><i class="ri-sparkling-2-line"></i> RAG AI Engine</div>
      Chat reset! Describe your symptoms to begin a new appointment booking.
    </div>`;
  updateSlotUI(state.slots, state.bookingStatus);
  const ragEl = document.getElementById('rag-matched-rule');
  if (ragEl) ragEl.innerHTML = 'No match yet';
  showToast('New conversation started');
}

// ===================== DOCTOR CATALOG =====================
function renderDoctorCatalog() {
  const grid = document.getElementById('doctors-catalog-grid');
  if (!grid) return;

  const filterSpec = (document.getElementById('filter-specialty') || {}).value || 'all';
  const searchTxt  = ((document.getElementById('filter-search') || {}).value || '').toLowerCase();

  const filtered = state.doctors.filter(d =>
    d.status === 'approved' &&
    (filterSpec === 'all' || d.specialization === filterSpec) &&
    (d.name.toLowerCase().includes(searchTxt) || d.hospital.toLowerCase().includes(searchTxt))
  );

  grid.innerHTML = filtered.map(doc => `
    <div class="doctor-card">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="doctor-avatar-wrap"><i class="ri-user-md-line"></i></div>
        <div>
          <div class="doctor-name">${doc.name}</div>
          <div class="doctor-spec">${doc.specialization}</div>
        </div>
      </div>

      <div class="doctor-meta">
        <span><i class="ri-building-4-line"></i> ${doc.hospital}</span>
        <span><i class="ri-award-line"></i> ${doc.experience} years experience</span>
        <span><i class="ri-time-line"></i> ${doc.availableTime}</span>
        <span><i class="ri-money-rupee-circle-line"></i> ₹${doc.fee} consultation fee</span>
      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn-action btn-view" style="flex:1;justify-content:center;padding:8px;" onclick="openDoctorDetailModal('${doc.id}')">
          <i class="ri-eye-line"></i> View Profile
        </button>
        <button class="btn-action btn-approve" style="flex:1;justify-content:center;padding:8px;" onclick="openDirectBookingModal('${doc.id}')">
          <i class="ri-calendar-check-line"></i> Book
        </button>
      </div>
    </div>
  `).join('') || `<div style="color:var(--text-muted);font-size:0.9rem;padding:1rem;">No doctors found for the selected filters.</div>`;
}

// ===================== DOCTOR DETAIL MODAL =====================
function openDoctorDetailModal(docId) {
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById('dd-name').innerText    = doc.name;
  document.getElementById('dd-spec').innerText    = doc.specialization;
  document.getElementById('dd-hospital').innerText = doc.hospital;
  document.getElementById('dd-exp').innerText     = doc.experience + ' Years';
  document.getElementById('dd-time').innerText    = doc.availableTime;
  document.getElementById('dd-fee').innerText     = '₹' + doc.fee;
  document.getElementById('dd-about').innerText   = doc.about || 'Experienced specialist in their field.';

  const bookBtn = document.getElementById('dd-book-btn');
  bookBtn.onclick = () => { closeModal('modal-doctor-detail'); openDirectBookingModal(docId); };

  openModal('modal-doctor-detail');
}

// ===================== DIRECT BOOKING =====================
let _activeBookingDocId = null;

function openDirectBookingModal(docId) {
  _activeBookingDocId = docId;
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) return;
  document.getElementById('book-doc-name').value = doc.name;
  document.getElementById('book-doc-spec').value = doc.specialization;
  document.getElementById('book-date-input').value = getToday();
  openModal('modal-booking');
}

function confirmDirectBooking() {
  const doc  = state.doctors.find(d => d.id === _activeBookingDocId);
  const date = document.getElementById('book-date-input').value;
  const time = document.getElementById('book-time-select').value;
  if (!date) { showToast('Please select a date'); return; }

  const booking = {
    id: 'APT-' + Math.floor(1000 + Math.random() * 9000),
    patientName: 'Rahul Sharma',
    patientPhone: '+91 9876543210',
    doctorId: doc.id,
    doctorName: doc.name,
    specialty: doc.specialization,
    date, time,
    symptom: 'Direct Consultation',
    status: 'booked'
  };
  state.appointments.push(booking);
  closeModal('modal-booking');
  renderAllTables();
  renderDoctorDashboard();
  renderAdminDashboard();
  showToast(`Appointment booked with ${doc.name}`);
}

// ===================== RENDER ALL TABLES =====================
function renderAllTables() {
  // Patient Appointments
  const patientBody = document.getElementById('patient-appointments-list');
  if (patientBody) {
    patientBody.innerHTML = state.appointments.length ? state.appointments.map(apt => `
      <tr>
        <td><code>#${apt.id}</code></td>
        <td><b>${apt.doctorName}</b></td>
        <td>${apt.specialty}</td>
        <td>${apt.date} &nbsp; ${apt.time}</td>
        <td><span class="badge badge-${apt.status}">${apt.status}</span></td>
        <td>
          ${apt.status === 'booked' ? `<button class="btn-action btn-reject" onclick="cancelAppointment('${apt.id}')"><i class="ri-close-line"></i> Cancel</button>` : '—'}
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:1.5rem;">No appointments found.</td></tr>';
  }

  // Doctor Schedule Table
  const docBody = document.getElementById('doctor-appointments-list');
  if (docBody) {
    docBody.innerHTML = state.appointments.map(apt => `
      <tr>
        <td><b>${apt.patientName}</b><br><small style="color:var(--text-muted);">${apt.patientPhone}</small></td>
        <td>${apt.patientPhone}</td>
        <td>${apt.symptom}</td>
        <td>${apt.date} &nbsp; ${apt.time}</td>
        <td><span class="badge badge-${apt.status}">${apt.status}</span></td>
        <td>
          ${apt.status === 'booked'
            ? `<button class="btn-action btn-approve" onclick="updateApptStatus('${apt.id}','completed')"><i class="ri-check-line"></i> Complete</button>`
            : '—'}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No appointments yet.</td></tr>';
  }

  // Admin Appointments Table
  const adminBody = document.getElementById('admin-appointments-table-body');
  if (adminBody) {
    adminBody.innerHTML = state.appointments.map(apt => `
      <tr>
        <td><code>#${apt.id}</code></td>
        <td>${apt.patientName}</td>
        <td><b>${apt.doctorName}</b></td>
        <td>${apt.date} &nbsp; ${apt.time}</td>
        <td><span class="badge badge-${apt.status}">${apt.status}</span></td>
        <td>
          ${apt.status === 'booked' ? `<button class="btn-action btn-approve" onclick="updateApptStatus('${apt.id}','completed')"><i class="ri-check-line"></i> Complete</button>` : ''}
          ${apt.status !== 'cancelled' ? `<button class="btn-action btn-reject" onclick="cancelAppointment('${apt.id}')"><i class="ri-close-line"></i> Cancel</button>` : '—'}
        </td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No appointments yet.</td></tr>';
  }

  // Admin Doctors Table
  const adminDocBody = document.getElementById('admin-doctors-table-body');
  if (adminDocBody) {
    adminDocBody.innerHTML = state.doctors.map(doc => `
      <tr>
        <td><b>${doc.name}</b></td>
        <td><span class="badge badge-booked">${doc.specialization}</span></td>
        <td>${doc.hospital}</td>
        <td>${doc.experience} yrs</td>
        <td><span class="badge badge-${doc.status}">${doc.status}</span></td>
        <td>
          <button class="btn-action btn-reject" onclick="removeDoctor('${doc.id}')"><i class="ri-delete-bin-6-line"></i> Remove</button>
        </td>
      </tr>
    `).join('');
  }

  // Admin Knowledge Base Table
  const kbBody = document.getElementById('admin-kb-table-body');
  if (kbBody) {
    kbBody.innerHTML = state.knowledgeBase.map(kb => `
      <tr>
        <td><b>${kb.title}</b></td>
        <td><span class="badge badge-completed">${kb.category}</span></td>
        <td style="max-width:200px;">${kb.content}</td>
        <td><code style="font-size:0.78rem;">${kb.keywords.join(', ')}</code></td>
        <td>
          <button class="btn-action btn-reject" onclick="deleteKbRule('${kb.id}')"><i class="ri-delete-bin-6-line"></i> Delete</button>
        </td>
      </tr>
    `).join('');
  }
}

// ===================== APPOINTMENT ACTIONS =====================
function cancelAppointment(id) {
  const apt = state.appointments.find(a => a.id === id);
  if (apt) { apt.status = 'cancelled'; renderAllTables(); renderDoctorDashboard(); renderAdminDashboard(); showToast(`Appointment #${id} cancelled`); }
}

function updateApptStatus(id, newStatus) {
  const apt = state.appointments.find(a => a.id === id);
  if (apt) { apt.status = newStatus; renderAllTables(); renderDoctorDashboard(); renderAdminDashboard(); showToast(`Status updated to "${newStatus}"`); }
}

// ===================== DOCTOR DASHBOARD =====================
function renderDoctorDashboard() {
  const queue = document.getElementById('doctor-patient-queue');
  if (queue) {
    const items = state.appointments.filter(a => a.status === 'booked');
    queue.innerHTML = items.length ? items.map(apt => `
      <div style="background:var(--bg-inset);border:1px solid var(--border-soft);border-radius:var(--radius-sm);padding:12px 14px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-weight:700;font-size:0.9rem;">${apt.patientName}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;"><i class="ri-pulse-line"></i> ${apt.symptom}</div>
          <div style="font-size:0.75rem;color:var(--secondary);margin-top:3px;"><i class="ri-time-line"></i> ${apt.date} &nbsp;·&nbsp; ${apt.time}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;">
          <span class="badge badge-booked">booked</span>
          <button class="btn-action btn-approve" style="font-size:0.75rem;" onclick="updateApptStatus('${apt.id}','completed')">
            <i class="ri-check-line"></i> Complete
          </button>
        </div>
      </div>
    `).join('') : `<div style="font-size:0.85rem;color:var(--text-muted);padding:0.5rem 0;">No patients queued for today.</div>`;
  }

  const booked    = state.appointments.filter(a => a.status === 'booked').length;
  const completed = state.appointments.filter(a => a.status === 'completed').length;

  const todayEl = document.getElementById('doc-stat-today');
  const compEl  = document.getElementById('doc-stat-completed');
  const pendEl  = document.getElementById('doc-stat-pending');
  if (todayEl) todayEl.innerText = state.appointments.length;
  if (compEl)  compEl.innerText  = completed;
  if (pendEl)  pendEl.innerText  = booked;
}

// ===================== WEEKLY CHART =====================
function renderWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  if (!chart) return;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max  = Math.max(...state.weeklyData);
  chart.innerHTML = state.weeklyData.map((count, i) => `
    <div class="chart-bar-wrap">
      <div class="chart-count">${count}</div>
      <div class="chart-bar" style="height:${Math.max((count / max) * 80, 4)}px;" title="${count} patients"></div>
      <div class="chart-day">${days[i]}</div>
    </div>
  `).join('');
}

// ===================== ADMIN DASHBOARD =====================
function renderAdminDashboard() {
  // Stats
  const approvedDocs = state.doctors.filter(d => d.status === 'approved');
  const el = (id) => document.getElementById(id);
  if (el('admin-stat-doctors')) el('admin-stat-doctors').innerText = approvedDocs.length;
  if (el('admin-stat-bookings')) el('admin-stat-bookings').innerText = state.appointments.length;
  if (el('admin-stat-pending')) el('admin-stat-pending').innerText = state.pendingDoctors.length;

  // Pending Approval Badge
  const approvalBadge = el('approval-count-badge');
  if (approvalBadge) approvalBadge.innerText = state.pendingDoctors.length + ' pending';

  // Doctor Approvals
  const approvalList = el('doctor-approvals-list');
  if (approvalList) {
    approvalList.innerHTML = state.pendingDoctors.length ? state.pendingDoctors.map(d => `
      <div class="approval-card">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="doctor-avatar-wrap" style="width:40px;height:40px;"><i class="ri-user-md-line"></i></div>
          <div>
            <div style="font-weight:700;font-size:0.9rem;">${d.name}</div>
            <div style="font-size:0.78rem;color:var(--secondary);">${d.specialization} — ${d.hospital}</div>
            <div style="font-size:0.73rem;color:var(--text-muted);margin-top:2px;">${d.experience} yrs exp · ₹${d.fee} fee · Applied: ${d.registeredAt}</div>
          </div>
        </div>
        <div style="display:flex;gap:7px;flex-shrink:0;">
          <button class="btn-action btn-approve" onclick="approveDoctor('${d.id}')"><i class="ri-check-line"></i> Approve</button>
          <button class="btn-action btn-reject"  onclick="rejectDoctor('${d.id}')"><i class="ri-close-line"></i> Reject</button>
        </div>
      </div>
    `).join('') : `<div style="font-size:0.85rem;color:var(--text-muted);padding:0.5rem 0;">No pending approvals.</div>`;
  }

  // Specialty Coverage
  const allSpecialties = ['Orthopedic', 'Cardiologist', 'Dermatologist', 'ENT Specialist', 'General Physician', 'Pediatrician', 'Neurologist'];
  const coveredSpecs  = [...new Set(approvedDocs.map(d => d.specialization))];
  const chipsEl = el('specialty-coverage-chips');
  if (chipsEl) {
    chipsEl.innerHTML = allSpecialties.map(s => {
      const covered = coveredSpecs.includes(s);
      return `<span class="specialty-chip ${covered ? 'chip-covered' : 'chip-missing'}">
        <i class="${covered ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}"></i> ${s}
      </span>`;
    }).join('');
  }

  // RAG rule count
  const ragRuleEl = el('rag-rule-count');
  if (ragRuleEl) ragRuleEl.innerText = state.knowledgeBase.length + ' rules';
}

// ===================== DOCTOR APPROVAL =====================
function approveDoctor(pendId) {
  const pend = state.pendingDoctors.find(d => d.id === pendId);
  if (!pend) return;
  state.doctors.push({
    id: 'doc' + (state.doctors.length + 1),
    name: pend.name,
    specialization: pend.specialization,
    hospital: pend.hospital,
    experience: pend.experience,
    fee: pend.fee,
    availableTime: '09:00 - 13:00',
    status: 'approved',
    about: `${pend.name} is an experienced ${pend.specialization} with ${pend.experience} years of practice at ${pend.hospital}.`
  });
  state.pendingDoctors = state.pendingDoctors.filter(d => d.id !== pendId);
  renderAdminDashboard();
  renderAllTables();
  renderDoctorCatalog();
  showToast(`${pend.name} approved and added to the platform!`);
}

function rejectDoctor(pendId) {
  const pend = state.pendingDoctors.find(d => d.id === pendId);
  state.pendingDoctors = state.pendingDoctors.filter(d => d.id !== pendId);
  renderAdminDashboard();
  showToast(`${pend ? pend.name + ' rejected' : 'Doctor rejected'}.`);
}

// ===================== DOCTOR CRUD =====================
function saveNewDoctor() {
  const name     = document.getElementById('new-doc-name').value.trim();
  const spec     = document.getElementById('new-doc-spec').value;
  const hospital = document.getElementById('new-doc-hospital').value.trim() || 'Apollo Hospital';
  const exp      = parseInt(document.getElementById('new-doc-exp').value) || 5;
  const fee      = parseInt(document.getElementById('new-doc-fee').value) || 500;

  if (!name) { showToast('Please enter a doctor name'); return; }

  state.doctors.push({
    id: 'doc' + (state.doctors.length + 1),
    name, specialization: spec, hospital, experience: exp, fee,
    availableTime: '09:00 - 13:00',
    status: 'approved',
    about: `${name} is an experienced ${spec} with ${exp} years of practice.`
  });

  closeModal('modal-add-doctor');
  renderDoctorCatalog();
  renderAllTables();
  renderAdminDashboard();
  showToast(`${name} added successfully.`);
}

function removeDoctor(id) {
  const doc = state.doctors.find(d => d.id === id);
  state.doctors = state.doctors.filter(d => d.id !== id);
  renderDoctorCatalog();
  renderAllTables();
  renderAdminDashboard();
  showToast(`${doc ? doc.name : 'Doctor'} removed from platform.`);
}

// ===================== KB CRUD =====================
function saveNewKbRule() {
  const title    = document.getElementById('new-kb-title').value.trim();
  const category = document.getElementById('new-kb-category').value.trim();
  const content  = document.getElementById('new-kb-content').value.trim();
  const keywords = document.getElementById('new-kb-keywords').value.split(',').map(k => k.trim()).filter(Boolean);

  if (!title || !category) { showToast('Please fill in title and specialty'); return; }

  state.knowledgeBase.push({
    id: 'kb' + (state.knowledgeBase.length + 1),
    title, category, content, keywords
  });

  closeModal('modal-add-kb');
  renderAllTables();
  renderAdminDashboard();
  showToast(`Knowledge rule "${title}" added and indexed.`);
}

function deleteKbRule(id) {
  state.knowledgeBase = state.knowledgeBase.filter(k => k.id !== id);
  renderAllTables();
  renderAdminDashboard();
  showToast('Knowledge rule deleted.');
}

// ===================== DOCTOR AVAILABILITY =====================
function updateDoctorSlots() {
  const val = document.getElementById('doctor-slot-input').value.trim();
  const doc = state.doctors.find(d => d.name.includes('Rajesh Sharma'));
  if (doc) { doc.availableTime = val; renderDoctorCatalog(); renderAllTables(); showToast('Availability updated!'); }
}

// ===================== MODAL HELPERS =====================
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ===================== DATE HELPERS =====================
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ===================== TOAST =====================
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ri-information-line" style="color:var(--secondary);font-size:1rem;"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
