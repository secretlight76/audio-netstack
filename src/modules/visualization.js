/**
 * Visualization Module - Gestion de l'affichage et des mises à jour UI
 * @module visualization
 */

import { state, SIZES } from './state.js';

/**
 * Met à jour la visualisation du paquet éclaté
 * @param {Object} results - Résultats des calculs
 */
export function updatePacketVisualization(results) {
    const container = document.getElementById('packet-layers');
    const { payloadSize, totalPacketSize, efficiency, mtuExceeded } = results;

    const ethernetSize = SIZES.ethernet;
    const ipSize = SIZES.ip;
    const udpSize = SIZES.udp;
    const rtpSize = state.protocol === 'aes67' ? SIZES.rtp : 0;
    const fcsSize = SIZES.fcs;

    const layers = [
        {
            name: 'Trame Ethernet',
            size: ethernetSize + fcsSize,
            color: 'from-gray-400 to-gray-500',
            indent: 0,
            description: `En-tête (${ethernetSize} o) + FCS (${fcsSize} o)`
        },
        {
            name: 'En-tête IP',
            size: ipSize,
            color: 'from-blue-400 to-blue-500',
            indent: 1,
            description: 'IPv4'
        },
        {
            name: 'En-tête UDP',
            size: udpSize,
            color: 'from-green-400 to-green-500',
            indent: 2,
            description: 'Transport'
        }
    ];

    if (state.protocol === 'aes67') {
        layers.push({
            name: 'En-tête RTP',
            size: rtpSize,
            color: 'from-yellow-400 to-yellow-500',
            indent: 3,
            description: 'Real-time Transport Protocol'
        });
    }

    layers.push({
        name: 'Payload Audio (Données Utiles)',
        size: payloadSize,
        color: 'from-purple-500 to-pink-500',
        indent: state.protocol === 'aes67' ? 4 : 3,
        description: `${state.channels} canaux × ${state.samplesPerPacket} échantillons × ${state.bitDepth} bits`,
        highlight: true
    });

    container.innerHTML = layers.map(layer => `
        <div class="packet-layer flex items-center" style="margin-left: ${layer.indent * 20}px">
            <div class="flex-1 bg-gradient-to-r ${layer.color} text-white p-4 rounded-lg shadow-md ${layer.highlight ? 'border-4 border-yellow-300' : ''}">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-semibold text-lg">${layer.name}</div>
                        <div class="text-sm opacity-90">${layer.description}</div>
                    </div>
                    <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <span class="font-bold text-xl">${layer.size}</span>
                        <span class="text-sm ml-1">octets</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML += `
        <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-400 dark:border-gray-600 transition-colors">
            <div class="flex justify-between items-center">
                <div class="font-bold text-gray-800 dark:text-gray-200">
                    TAILLE TOTALE (L2)
                </div>
                <div>
                    <span class="text-2xl font-bold ${mtuExceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}">
                        ${totalPacketSize}
                    </span>
                    <span class="text-gray-600 dark:text-gray-400 ml-1">o</span>
                </div>
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Efficacité : <strong>${efficiency.toFixed(1)}%</strong> de données utiles
            </div>
        </div>
    `;

    const mtuWarning = document.getElementById('mtu-warning');
    mtuWarning.classList.toggle('hidden', !mtuExceeded);
}

/**
 * Met à jour la visualisation de la payload audio
 * @param {number} payloadSize - Taille de la payload
 */
export function updatePayloadVisualization(payloadSize) {
    const container = document.getElementById('payload-visualization');
    const infoDiv = document.getElementById('payload-info');

    infoDiv.innerHTML = `
        <p class="font-semibold">
            Ce paquet transporte <span class="text-blue-600 dark:text-blue-400 text-lg">${state.samplesPerPacket}</span>
            échantillons pour <span class="text-blue-600 dark:text-blue-400 text-lg">${state.channels}</span>
            ${state.channels > 1 ? 'canaux' : 'canal'}.
        </p>
        <p class="text-sm mt-1">
            Taille : <strong>${payloadSize} octets</strong>
        </p>
    `;

    const displayChannels = Math.min(state.channels, 16);
    const displaySamples = Math.min(state.samplesPerPacket, 64);

    let html = '';
    for (let ch = 0; ch < displayChannels; ch++) {
        html += `<div class="mb-2">`;
        html += `<div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Canal ${ch + 1}</div>`;
        html += `<div class="flex flex-wrap gap-1">`;
        for (let s = 0; s < displaySamples; s++) {
            html += `<div class="sample-dot" title="Canal ${ch + 1}, Échantillon ${s + 1}"></div>`;
        }
        if (state.samplesPerPacket > displaySamples) {
            html += `<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">... +${state.samplesPerPacket - displaySamples}</span>`;
        }
        html += `</div></div>`;
    }

    if (state.channels > displayChannels) {
        html += `<div class="text-sm text-gray-500 dark:text-gray-400 mt-2">... +${state.channels - displayChannels} canaux</div>`;
    }

    container.innerHTML = html;
}

/**
 * Met à jour une barre de latence
 * @param {string} type - Type de latence
 * @param {number} value - Valeur en ms
 * @param {number} total - Latence totale
 * @param {number} maxWidth - Largeur maximale en pourcentage
 */
function updateLatencyBar(type, value, total, maxWidth) {
    const bar = document.getElementById(`latency-${type}-bar`);
    const text = document.getElementById(`latency-${type}`);

    const width = (value / total) * maxWidth;
    bar.style.width = `${width}%`;
    text.textContent = `${value.toFixed(2)} ms`;
}

/**
 * Met à jour la visualisation de la latence
 * @param {Object} results - Résultats des calculs
 */
export function updateLatencyVisualization(results) {
    const { packetizationLatency, networkLatency, totalLatency } = results;
    const maxWidth = 100;

    updateLatencyBar('packetization', packetizationLatency, totalLatency, maxWidth);
    updateLatencyBar('tx', state.txBuffer, totalLatency, maxWidth);
    updateLatencyBar('network', networkLatency, totalLatency, maxWidth);
    updateLatencyBar('jitter', state.jitterBuffer, totalLatency, maxWidth);
    updateLatencyBar('total', totalLatency, totalLatency, maxWidth);

    const efficiencyDiv = document.getElementById('efficiency-info');
    let message = '';

    if (packetizationLatency > totalLatency * 0.5) {
        message = `⚠️ La latence de paquetisation (${packetizationLatency.toFixed(2)} ms) représente plus de 50% de la latence totale.
                  Réduisez le nombre d'échantillons par paquet pour diminuer la latence.`;
    } else if (state.jitterBuffer > totalLatency * 0.5) {
        message = `Le Jitter Buffer (${state.jitterBuffer} ms) représente plus de 50% de la latence totale.
                  Si votre réseau est stable, vous pouvez le réduire.`;
    } else {
        message = `✅ Bonne répartition de la latence. La latence de paquetisation est de ${packetizationLatency.toFixed(2)} ms
                  pour ${state.samplesPerPacket} échantillons à ${state.sampleRate / 1000} kHz.`;
    }

    efficiencyDiv.innerHTML = `<p class="text-sm">${message}</p>`;
}

/**
 * Met à jour l'affichage de la charge réseau
 * @param {Object} results - Résultats des calculs
 */
export function updateNetworkLoad(results) {
    const { packetsPerSecond, bandwidth } = results;

    document.getElementById('pps').textContent = Math.round(packetsPerSecond) + ' pps';
    document.getElementById('bandwidth').textContent = bandwidth.toFixed(2) + ' Mbps';

    const analysisDiv = document.getElementById('network-analysis');
    let analysis = `
        <p class="mb-2">
            <strong>Analyse :</strong> Avec ces réglages, votre flux audio de
            <strong>${state.channels} ${state.channels > 1 ? 'canaux' : 'canal'}</strong>
            utilise <strong>${bandwidth.toFixed(2)} Mbps</strong> de bande passante.
        </p>
    `;

    if (state.samplesPerPacket < 128) {
        analysis += `
            <p class="text-orange-600 dark:text-orange-400">
                💡 Paquets petits (${state.samplesPerPacket} échantillons) = <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Plus de charge CPU mais latence minimale.
            </p>
        `;
    } else if (state.samplesPerPacket > 512) {
        analysis += `
            <p class="text-blue-600 dark:text-blue-400">
                💡 Gros paquets (${state.samplesPerPacket} échantillons) = <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Efficace réseau mais latence accrue.
            </p>
        `;
    } else {
        analysis += `
            <p class="text-green-600 dark:text-green-400">
                ✅ Équilibré : <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Bon compromis latence/efficacité.
            </p>
        `;
    }

    const gigabitCapacity = 1000;
    const percentUsed = (bandwidth / gigabitCapacity) * 100;

    analysis += `
        <p class="mt-2 text-xs">
            Sur Gigabit : <strong>${percentUsed.toFixed(2)}%</strong> de capacité utilisée.
        </p>
    `;

    analysisDiv.innerHTML = analysis;
}

/**
 * Met à jour l'affichage du port selon le protocole
 */
export function updatePortInfo() {
    const portDisplay = document.getElementById('port-display');
    portDisplay.textContent = state.protocol === 'aes67' ? 'RTP 5004' : 'UDP 4321';
}

/**
 * Met à jour toute l'interface avec les nouveaux résultats
 * @param {Object} results - Résultats des calculs
 */
export function updateUI(results) {
    updatePacketVisualization(results);
    updatePayloadVisualization(results.payloadSize);
    updateLatencyVisualization(results);
    updateNetworkLoad(results);
}
