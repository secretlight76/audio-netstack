/**
 * Visualization Module - UI display and update management
 * @module visualization
 */

import { state, SIZES } from './state.js';

/**
 * Updates packet layer visualization
 * @param {Object} results - Calculation results
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
            name: 'Ethernet Frame',
            size: ethernetSize + fcsSize,
            color: 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700',
            indent: 0,
            description: `Header (${ethernetSize} B) + FCS (${fcsSize} B)`
        },
        {
            name: 'IP Header',
            size: ipSize,
            color: 'from-blue-300 to-blue-400 dark:from-blue-700 dark:to-blue-800',
            indent: 1,
            description: 'IPv4'
        },
        {
            name: 'UDP Header',
            size: udpSize,
            color: 'from-emerald-300 to-emerald-400 dark:from-emerald-700 dark:to-emerald-800',
            indent: 2,
            description: 'Transport'
        }
    ];

    if (state.protocol === 'aes67') {
        layers.push({
            name: 'RTP Header',
            size: rtpSize,
            color: 'from-amber-300 to-amber-400 dark:from-amber-700 dark:to-amber-800',
            indent: 3,
            description: 'Real-time Transport Protocol'
        });
    }

    layers.push({
        name: 'Audio Payload (Useful Data)',
        size: payloadSize,
        color: 'from-violet-300 to-violet-400 dark:from-violet-700 dark:to-violet-800',
        indent: state.protocol === 'aes67' ? 4 : 3,
        description: `${state.channels} channels × ${state.samplesPerPacket} samples × ${state.bitDepth} bits`,
        highlight: true
    });

    container.innerHTML = layers.map(layer => `
        <div class="packet-layer flex items-center" style="margin-left: ${layer.indent * 20}px">
            <div class="flex-1 bg-gradient-to-r ${layer.color} text-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm ${layer.highlight ? 'border-2 border-violet-400 dark:border-violet-500' : ''}">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-semibold text-base">${layer.name}</div>
                        <div class="text-sm opacity-75">${layer.description}</div>
                    </div>
                    <div class="bg-gray-800 dark:bg-gray-200 bg-opacity-10 dark:bg-opacity-20 px-3 py-1.5 rounded">
                        <span class="font-bold text-lg">${layer.size}</span>
                        <span class="text-xs ml-1">bytes</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML += `
        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors">
            <div class="flex justify-between items-center">
                <div class="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                    Total Size (L2)
                </div>
                <div>
                    <span class="text-xl font-bold ${mtuExceeded ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}">
                        ${totalPacketSize}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400 ml-1 text-sm">bytes</span>
                </div>
            </div>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Efficiency: <strong class="text-gray-700 dark:text-gray-300">${efficiency.toFixed(1)}%</strong> useful data
            </div>
        </div>
    `;

    const mtuWarning = document.getElementById('mtu-warning');
    mtuWarning.classList.toggle('hidden', !mtuExceeded);
}

/**
 * Updates audio payload visualization
 * @param {number} payloadSize - Payload size
 */
export function updatePayloadVisualization(payloadSize) {
    const container = document.getElementById('payload-visualization');
    const infoDiv = document.getElementById('payload-info');

    infoDiv.innerHTML = `
        <p class="font-medium text-gray-700 dark:text-gray-300">
            This packet carries <span class="text-violet-600 dark:text-violet-400 font-semibold">${state.samplesPerPacket}</span>
            samples for <span class="text-violet-600 dark:text-violet-400 font-semibold">${state.channels}</span>
            ${state.channels > 1 ? 'channels' : 'channel'}.
        </p>
        <p class="text-sm mt-1 text-gray-600 dark:text-gray-400">
            Size: <strong class="text-gray-700 dark:text-gray-300">${payloadSize} bytes</strong>
        </p>
    `;

    const displayChannels = Math.min(state.channels, 16);
    const displaySamples = Math.min(state.samplesPerPacket, 64);

    let html = '';
    for (let ch = 0; ch < displayChannels; ch++) {
        html += `<div class="mb-2">`;
        html += `<div class="text-xs text-gray-500 dark:text-gray-500 mb-1 font-medium">Channel ${ch + 1}</div>`;
        html += `<div class="flex flex-wrap gap-1">`;
        for (let s = 0; s < displaySamples; s++) {
            html += `<div class="sample-dot" title="Channel ${ch + 1}, Sample ${s + 1}"></div>`;
        }
        if (state.samplesPerPacket > displaySamples) {
            html += `<span class="text-xs text-gray-500 dark:text-gray-500 ml-2">... +${state.samplesPerPacket - displaySamples}</span>`;
        }
        html += `</div></div>`;
    }

    if (state.channels > displayChannels) {
        html += `<div class="text-sm text-gray-500 dark:text-gray-500 mt-2">... +${state.channels - displayChannels} channels</div>`;
    }

    container.innerHTML = html;
}

/**
 * Updates a latency bar
 * @param {string} type - Latency type
 * @param {number} value - Value in ms
 * @param {number} total - Total latency
 * @param {number} maxWidth - Maximum width in percentage
 */
function updateLatencyBar(type, value, total, maxWidth) {
    const bar = document.getElementById(`latency-${type}-bar`);
    const text = document.getElementById(`latency-${type}`);

    const width = (value / total) * maxWidth;
    bar.style.width = `${width}%`;
    text.textContent = `${value.toFixed(2)} ms`;
}

/**
 * Updates latency visualization
 * @param {Object} results - Calculation results
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
        message = `[NOTICE] Packetization latency (${packetizationLatency.toFixed(2)} ms) exceeds 50% of total latency.
                  Reduce samples per packet to decrease latency.`;
    } else if (state.jitterBuffer > totalLatency * 0.5) {
        message = `[INFO] Jitter buffer (${state.jitterBuffer} ms) represents >50% of total latency.
                  Consider reducing if network is stable.`;
    } else {
        message = `[OK] Balanced latency distribution. Packetization: ${packetizationLatency.toFixed(2)} ms
                  for ${state.samplesPerPacket} samples @ ${state.sampleRate / 1000} kHz.`;
    }

    efficiencyDiv.innerHTML = `<p class="text-sm">${message}</p>`;
}

/**
 * Updates network load display
 * @param {Object} results - Calculation results
 */
export function updateNetworkLoad(results) {
    const { packetsPerSecond, bandwidth } = results;

    document.getElementById('pps').textContent = Math.round(packetsPerSecond) + ' pps';
    document.getElementById('bandwidth').textContent = bandwidth.toFixed(2) + ' Mbps';

    const analysisDiv = document.getElementById('network-analysis');
    let analysis = `
        <p class="mb-2 text-gray-700 dark:text-gray-300">
            <strong>Stream Analysis:</strong> ${state.channels} channel${state.channels > 1 ? 's' : ''} using
            <strong>${bandwidth.toFixed(2)} Mbps</strong> bandwidth.
        </p>
    `;

    if (state.samplesPerPacket < 128) {
        analysis += `
            <p class="text-gray-600 dark:text-gray-400 text-xs">
                [LOW LATENCY] Small packets (${state.samplesPerPacket} samples) = <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Higher CPU load, minimum latency.
            </p>
        `;
    } else if (state.samplesPerPacket > 512) {
        analysis += `
            <p class="text-gray-600 dark:text-gray-400 text-xs">
                [HIGH EFFICIENCY] Large packets (${state.samplesPerPacket} samples) = <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Network efficient, increased latency.
            </p>
        `;
    } else {
        analysis += `
            <p class="text-gray-600 dark:text-gray-400 text-xs">
                [BALANCED] <strong>${Math.round(packetsPerSecond)} pps</strong>.
                Optimal latency/efficiency trade-off.
            </p>
        `;
    }

    const gigabitCapacity = 1000;
    const percentUsed = (bandwidth / gigabitCapacity) * 100;

    analysis += `
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Gigabit utilization: <strong>${percentUsed.toFixed(2)}%</strong>
        </p>
    `;

    analysisDiv.innerHTML = analysis;
}

/**
 * Updates port display according to protocol
 */
export function updatePortInfo() {
    const portDisplay = document.getElementById('port-display');
    portDisplay.textContent = state.protocol === 'aes67' ? 'RTP 5004' : 'UDP 4321';
}

/**
 * Updates entire interface with new results
 * @param {Object} results - Calculation results
 */
export function updateUI(results) {
    updatePacketVisualization(results);
    updatePayloadVisualization(results.payloadSize);
    updateLatencyVisualization(results);
    updateNetworkLoad(results);
}
