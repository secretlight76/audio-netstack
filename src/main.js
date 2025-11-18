/**
 * Main Application Entry Point
 * Visualisateur de Stacks Réseau Audio : Dante & AES67
 */

import { state } from './modules/state.js';
import { performAllCalculations } from './modules/calculations.js';
import { updateUI, updatePortInfo } from './modules/visualization.js';
import './styles.css';

/**
 * Effectue tous les calculs et met à jour l'interface
 */
function calculate() {
    const results = performAllCalculations();
    updateUI(results);
    updateRecommendations(results);
}

/**
 * Met à jour les recommandations dynamiques
 */
function updateRecommendations(results) {
    const container = document.getElementById('recommendations');
    const recommendations = [];

    // Recommandation sur la paquetisation
    if (state.samplesPerPacket < 64) {
        recommendations.push('✅ <strong>Latence ultra-faible</strong> avec ' + state.samplesPerPacket + ' échantillons. Parfait pour le live monitoring.');
    } else if (state.samplesPerPacket > 512) {
        recommendations.push('⚠️ Latence élevée (' + results.packetizationLatency.toFixed(2) + ' ms). Réduisez les échantillons pour le live.');
    } else {
        recommendations.push('✅ Bon compromis latence/efficacité avec ' + state.samplesPerPacket + ' échantillons.');
    }

    // Recommandation sur le jitter buffer
    if (state.jitterBuffer > 20) {
        recommendations.push('💡 Jitter buffer élevé (' + state.jitterBuffer + ' ms). Vérifiez si vous pouvez le réduire sur votre réseau.');
    }

    // Recommandation sur la bande passante
    const percentBandwidth = (results.bandwidth / 1000) * 100;
    if (percentBandwidth > 1) {
        recommendations.push('⚠️ Utilise ' + percentBandwidth.toFixed(1) + '% d\'un réseau Gigabit. Attention si vous multipliez les flux.');
    } else {
        recommendations.push('✅ Bande passante optimale (' + results.bandwidth.toFixed(2) + ' Mbps). Vous pouvez transporter plusieurs flux.');
    }

    // Recommandation MTU
    if (results.mtuExceeded) {
        recommendations.push('🔴 <strong>Paquet trop gros !</strong> Risque de fragmentation. Réduisez canaux ou échantillons.');
    }

    container.innerHTML = recommendations.map(r => `<div class="flex items-start gap-2"><span class="flex-shrink-0">•</span><span>${r}</span></div>`).join('');
}

/**
 * Initialise le Dark Mode
 */
function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Vérifier la préférence sauvegardée ou la préférence système
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.classList.add('dark');
    }

    // Toggle au clic
    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

/**
 * Initialise les écouteurs d'événements sur tous les contrôles
 */
function initializeEventListeners() {
    // Protocole
    document.querySelectorAll('input[name="protocol"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.protocol = e.target.value;
            updatePortInfo();
            calculate();
        });
    });

    // Taux d'échantillonnage
    document.getElementById('sample-rate').addEventListener('change', (e) => {
        state.sampleRate = parseInt(e.target.value);
        calculate();
    });

    // Profondeur de bits
    document.getElementById('bit-depth').addEventListener('change', (e) => {
        state.bitDepth = parseInt(e.target.value);
        calculate();
    });

    // Nombre de canaux
    document.getElementById('channels').addEventListener('input', (e) => {
        state.channels = parseInt(e.target.value);
        document.getElementById('channels-value').textContent = state.channels;
        calculate();
    });

    // Échantillons par paquet (SLIDER au lieu de select)
    document.getElementById('samples-per-packet').addEventListener('input', (e) => {
        state.samplesPerPacket = parseInt(e.target.value);
        document.getElementById('samples-value').textContent = state.samplesPerPacket;
        calculate();
    });

    // Nombre de sauts
    document.getElementById('hops').addEventListener('input', (e) => {
        state.hops = parseInt(e.target.value);
        document.getElementById('hops-value').textContent = state.hops;
        calculate();
    });

    // Buffer d'émission
    document.getElementById('tx-buffer').addEventListener('input', (e) => {
        state.txBuffer = parseFloat(e.target.value);
        document.getElementById('tx-buffer-value').textContent = state.txBuffer.toFixed(1) + ' ms';
        calculate();
    });

    // Jitter Buffer
    document.getElementById('jitter-buffer').addEventListener('input', (e) => {
        state.jitterBuffer = parseFloat(e.target.value);
        document.getElementById('jitter-buffer-value').textContent = state.jitterBuffer + ' ms';
        calculate();
    });
}

/**
 * Initialisation de l'application au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Visualisateur Audio Réseau - Initialisation');

    initializeDarkMode();
    initializeEventListeners();
    updatePortInfo();
    calculate();

    console.log('✅ Application prête');
});
