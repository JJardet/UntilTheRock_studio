#!/usr/bin/env node

/**
 * Script de test de l'API UntilTheRock
 * Usage: node test-api.js
 */

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

// Helper pour faire des requêtes
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Logger de test
function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (details) console.log(`  ${colors.yellow}→${colors.reset} ${details}`);
    testsFailed++;
  }
}

// Tests
async function runTests() {
  console.log(`\n${colors.blue}🧪 Démarrage des tests API UntilTheRock${colors.reset}\n`);

  let adminToken = null;

  // Test 1: Login admin
  console.log('\n📝 Tests Authentification');
  const loginResult = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  if (loginResult.status === 200 && loginResult.data.token) {
    logTest('Login admin réussi', true);
    adminToken = loginResult.data.token;
  } else {
    logTest('Login admin', false, `Status: ${loginResult.status}`);
  }

  // Test 2: Vérification token
  if (adminToken) {
    const verifyResult = await apiRequest('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    logTest('Vérification token', verifyResult.status === 200);
  }

  // Test 3: Réservation matériel
  console.log('\n📦 Tests Réservations Matériel');
  const equipmentBooking = await apiRequest('/bookings/equipment', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      equipment: 'Guitare Fender',
      start_date: '2026-02-01',
      end_date: '2026-02-05',
      message: 'Test booking'
    })
  });
  logTest('Créer réservation matériel', equipmentBooking.status === 200);

  // Test 4: Réservation studio
  console.log('\n🎙️ Tests Réservations Studio');
  const studioBooking = await apiRequest('/bookings/studio', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Artist',
      email: 'artist@example.com',
      phone: '0123456789',
      studio_type: 'Studio A',
      date: '2026-02-10',
      time_slot: '14h00 - 18h00',
      duration: 4,
      message: 'Test session'
    })
  });
  logTest('Créer réservation studio', studioBooking.status === 200);

  // Test 5: Session enregistrement
  console.log('\n🎵 Tests Enregistrement');
  const recordingSession = await apiRequest('/bookings/recording', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Band',
      email: 'band@example.com',
      phone: '0123456789',
      project_type: 'Album',
      date: '2026-03-01',
      duration: 8,
      message: 'Test recording'
    })
  });
  logTest('Créer session enregistrement', recordingSession.status === 200);

  // Test 6: Contact
  console.log('\n📧 Tests Contact');
  const contactMessage = await apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Contact',
      email: 'contact@example.com',
      subject: 'Question de test',
      message: 'Ceci est un message de test'
    })
  });
  logTest('Envoyer message contact', contactMessage.status === 200);

  // Test 7: Récupérer toutes les réservations (admin)
  console.log('\n👑 Tests Admin');
  if (adminToken) {
    const allBookings = await apiRequest('/bookings/all', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    logTest('Récupérer réservations (admin)', allBookings.status === 200);

    const allContacts = await apiRequest('/contact', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    logTest('Récupérer contacts (admin)', allContacts.status === 200);
  }

  // Test 8: Portfolio
  console.log('\n🖼️ Tests Portfolio');
  const portfolioItems = await apiRequest('/portfolio');
  logTest('Récupérer portfolio', portfolioItems.status === 200);

  if (adminToken) {
    const addPortfolio = await apiRequest('/portfolio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        service_type: 'recording',
        title: 'Test Project',
        description: 'Test portfolio item',
        image_url: 'https://example.com/image.jpg',
        audio_url: 'https://example.com/audio.mp3'
      })
    });
    logTest('Ajouter élément portfolio (admin)', addPortfolio.status === 200);
  }

  // Test 9: Accès non autorisé
  console.log('\n🔒 Tests Sécurité');
  const unauthorizedAccess = await apiRequest('/bookings/all');
  logTest('Bloquer accès non autorisé', unauthorizedAccess.status === 401);

  // Résumé
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`\n📊 Résumé des tests:`);
  console.log(`   ${colors.green}✓ Réussis:${colors.reset} ${testsPassed}`);
  console.log(`   ${colors.red}✗ Échoués:${colors.reset} ${testsFailed}`);
  console.log(`   ${colors.blue}Total:${colors.reset} ${testsPassed + testsFailed}`);
  
  const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
  console.log(`   ${colors.yellow}Taux de réussite:${colors.reset} ${successRate}%`);
  
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 Tous les tests sont passés !${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Certains tests ont échoué${colors.reset}\n`);
    process.exit(1);
  }
}

// Vérifier que le serveur est accessible
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

// Main
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error(`\n${colors.red}❌ Le serveur n'est pas accessible sur http://localhost:3000${colors.reset}`);
    console.log('   Assurez-vous que le serveur est démarré avec: npm start\n');
    process.exit(1);
  }

  await runTests();
})();
