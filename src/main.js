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
        recommendations.push('[OK] <strong>Ultra-low latency</strong> with ' + state.samplesPerPacket + ' samples. Optimal for live monitoring.');
    } else if (state.samplesPerPacket > 512) {
        recommendations.push('[WARN] High latency (' + results.packetizationLatency.toFixed(2) + ' ms). Reduce samples for live applications.');
    } else {
        recommendations.push('[OK] Balanced latency/efficiency trade-off with ' + state.samplesPerPacket + ' samples.');
    }

    // Recommandation sur le jitter buffer
    if (state.jitterBuffer > 20) {
        recommendations.push('[INFO] High jitter buffer (' + state.jitterBuffer + ' ms). Consider reducing if network is stable.');
    }

    // Recommandation sur la bande passante
    const percentBandwidth = (results.bandwidth / 1000) * 100;
    if (percentBandwidth > 1) {
        recommendations.push('[WARN] Using ' + percentBandwidth.toFixed(1) + '% of Gigabit capacity. Monitor when multiplexing streams.');
    } else {
        recommendations.push('[OK] Optimal bandwidth (' + results.bandwidth.toFixed(2) + ' Mbps). Multiple streams feasible.');
    }

    // Recommandation MTU
    if (results.mtuExceeded) {
        recommendations.push('[ERROR] <strong>Packet oversized!</strong> Fragmentation risk. Reduce channels or samples.');
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

    // Échantillons par paquet - Synchronisation slider et input
    const samplesSlider = document.getElementById('samples-per-packet');
    const samplesInput = document.getElementById('samples-input');

    // Fonction de mise à jour des échantillons
    function updateSamples(value) {
        const samples = Math.max(6, Math.min(1024, parseInt(value)));
        state.samplesPerPacket = samples;
        samplesSlider.value = samples;
        samplesInput.value = samples;
        calculate();
    }

    samplesSlider.addEventListener('input', (e) => {
        updateSamples(e.target.value);
    });

    samplesInput.addEventListener('input', (e) => {
        updateSamples(e.target.value);
    });

    // Validation sur blur pour corriger les valeurs hors limites
    samplesInput.addEventListener('blur', (e) => {
        if (e.target.value < 6) e.target.value = 6;
        if (e.target.value > 1024) e.target.value = 1024;
        updateSamples(e.target.value);
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
    console.log('[INIT] Audio Network Stack Analyzer - Starting');

    initializeDarkMode();
    initializeEventListeners();
    updatePortInfo();
    calculate();

    console.log('[READY] Application initialized');
});
