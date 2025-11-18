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
 * Updates dynamic recommendations
 */
function updateRecommendations(results) {
    const container = document.getElementById('recommendations');
    const recommendations = [];

    // Packetization recommendation
    if (state.samplesPerPacket < 64) {
        recommendations.push('[OK] <strong>Ultra-low latency</strong> with ' + state.samplesPerPacket + ' samples. Optimal for live monitoring.');
    } else if (state.samplesPerPacket > 512) {
        recommendations.push('[WARN] High latency (' + results.packetizationLatency.toFixed(2) + ' ms). Reduce samples for live applications.');
    } else {
        recommendations.push('[OK] Balanced latency/efficiency trade-off with ' + state.samplesPerPacket + ' samples.');
    }

    // Jitter buffer recommendation
    if (state.jitterBuffer > 20) {
        recommendations.push('[INFO] High jitter buffer (' + state.jitterBuffer + ' ms). Consider reducing if network is stable.');
    }

    // Bandwidth recommendation
    const percentBandwidth = (results.bandwidth / 1000) * 100;
    if (percentBandwidth > 1) {
        recommendations.push('[WARN] Using ' + percentBandwidth.toFixed(1) + '% of Gigabit capacity. Monitor when multiplexing streams.');
    } else {
        recommendations.push('[OK] Optimal bandwidth (' + results.bandwidth.toFixed(2) + ' Mbps). Multiple streams feasible.');
    }

    // MTU recommendation
    if (results.mtuExceeded) {
        recommendations.push('[ERROR] <strong>Packet oversized!</strong> Fragmentation risk. Reduce channels or samples.');
    }

    // Dante channel limit recommendation based on sample rate
    if (state.protocol === 'dante') {
        let maxChannels = 512;
        if (state.sampleRate >= 176400) {
            maxChannels = 128;
        } else if (state.sampleRate >= 88200) {
            maxChannels = 256;
        }

        if (state.channels > maxChannels) {
            recommendations.push('[WARN] <strong>Dante limit exceeded:</strong> Max ' + maxChannels + ' channels @ ' + (state.sampleRate/1000) + ' kHz. Current: ' + state.channels + ' channels.');
        }
    }

    container.innerHTML = recommendations.map(r => `<div class="flex items-start gap-2"><span class="flex-shrink-0">•</span><span>${r}</span></div>`).join('');
}

/**
 * Initializes Dark Mode
 */
function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.classList.add('dark');
    }

    // Toggle on click
    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

/**
 * Initializes event listeners on all controls
 */
function initializeEventListeners() {
    // Protocol
    document.querySelectorAll('input[name="protocol"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.protocol = e.target.value;
            updatePortInfo();
            calculate();
        });
    });

    // Sample rate
    document.getElementById('sample-rate').addEventListener('change', (e) => {
        state.sampleRate = parseInt(e.target.value);
        calculate();
    });

    // Bit depth
    document.getElementById('bit-depth').addEventListener('change', (e) => {
        state.bitDepth = parseInt(e.target.value);
        calculate();
    });

    // Channel count
    document.getElementById('channels').addEventListener('input', (e) => {
        state.channels = parseInt(e.target.value);
        document.getElementById('channels-value').textContent = state.channels;
        calculate();
    });

    // Samples per packet - Slider and input synchronization
    const samplesSlider = document.getElementById('samples-per-packet');
    const samplesInput = document.getElementById('samples-input');

    // Update samples function
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

    // Validation on blur to correct out-of-range values
    samplesInput.addEventListener('blur', (e) => {
        if (e.target.value < 6) e.target.value = 6;
        if (e.target.value > 1024) e.target.value = 1024;
        updateSamples(e.target.value);
    });

    // Switch Type
    const switchTypeSelect = document.getElementById('switch-type');
    const switchExplanation = document.getElementById('switch-explanation');

    const switchExplanations = {
        'cut-through': 'Fastest switching mode. Forwards packets immediately after reading the destination MAC address. Minimal latency (~5 µs) but no error checking during forwarding.',
        'av-dedicated': 'Optimized for audio/video networks. Dante and AES67 certified switches provide balanced latency and reliability (~10 µs per hop).',
        'store-forward': 'Most reliable mode. Receives the entire frame, validates FCS checksum, then forwards. Higher latency (~30 µs) but guarantees error-free transmission.'
    };

    switchTypeSelect.addEventListener('change', (e) => {
        state.switchType = e.target.value;
        switchExplanation.textContent = switchExplanations[state.switchType];
        calculate();
    });

    // Network hops
    document.getElementById('hops').addEventListener('input', (e) => {
        state.hops = parseInt(e.target.value);
        document.getElementById('hops-value').textContent = state.hops;
        calculate();
    });

    // TX Buffer
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

    // Packet Loss
    document.getElementById('packet-loss').addEventListener('input', (e) => {
        state.packetLoss = parseFloat(e.target.value);
        document.getElementById('packet-loss-value').textContent = state.packetLoss.toFixed(1) + '%';
        calculate();
    });
}

/**
 * Application initialization on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[INIT] Audio Network Stack Analyzer - Starting');

    initializeDarkMode();
    initializeEventListeners();
    updatePortInfo();
    calculate();

    console.log('[READY] Application initialized');
});
