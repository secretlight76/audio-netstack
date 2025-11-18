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

    // Échantillons par paquet
    document.getElementById('samples-per-packet').addEventListener('change', (e) => {
        state.samplesPerPacket = parseInt(e.target.value);
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
        document.getElementById('tx-buffer-value').textContent = state.txBuffer + ' ms';
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

    initializeEventListeners();
    updatePortInfo();
    calculate();

    console.log('✅ Application prête');
});
