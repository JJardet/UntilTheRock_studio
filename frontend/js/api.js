// Configuration API
const API_URL = window.location.origin + '/api';

const api = {
  // Helper pour les requêtes
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },



async deleteBooking(type, id) {
  return this.request(`/bookings/${type}/${id}`, {
    method: 'DELETE'
  });
},

  // Authentification
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async verifyToken() {
    return this.request('/auth/verify');
  },

  // Réservations
  async bookEquipment(data) {
    return this.request('/bookings/equipment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async bookStudio(data) {
    return this.request('/bookings/studio', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async bookRecording(data) {
    return this.request('/bookings/recording', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    });
  },

  async downloadRecordingDemo(id) {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_URL}/bookings/recording/${id}/demo`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      blob: await response.blob(),
      filename: response.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/)?.[1] || 'maquette'
    };
  },

  async getAllBookings() {
    return this.request('/bookings/all');
  },

  async updateBookingStatus(type, id, status) {
    return this.request(`/bookings/${type}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Contact
  async sendContact(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getContacts() {
    return this.request('/contact');
  },

  async updateContactStatus(id, status) {
    return this.request(`/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Portfolio
  async getPortfolio(serviceType = null) {
    const query = serviceType ? `?service_type=${serviceType}` : '';
    return this.request(`/portfolio${query}`);
  },

  async addPortfolioItem(data) {
    return this.request('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updatePortfolioItem(id, data) {
    return this.request(`/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deletePortfolioItem(id) {
    return this.request(`/portfolio/${id}`, {
      method: 'DELETE'
    });
  },

  // Calendrier
  async getMonthAppointments(year, month) {
    return this.request(`/calendar/month/${year}/${month}`);
  },
  async getAvailableSlots(date) {
    return this.request(`/calendar/slots/${date}`);
  },
  async requestAppointment(data) {
    return this.request('/calendar/request', { method: 'POST', body: JSON.stringify(data) });
  },
  async getAllAppointments() {
    return this.request('/calendar/all');
  },
  async updateAppointmentStatus(id, status) {
    return this.request(`/calendar/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },
  async deleteAppointment(id) {
    return this.request(`/calendar/${id}`, { method: 'DELETE' });
  },
  async blockSlot(data) {
    return this.request('/calendar/block', { method: 'POST', body: JSON.stringify(data) });
  },
};
