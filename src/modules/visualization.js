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
 * Formats latency value with adaptive units (ns, µs, or ms)
 * @param {number} valueInMs - Value in milliseconds
 * @returns {string} Formatted string with appropriate unit
 */
function formatLatency(valueInMs) {
    if (valueInMs >= 1) {
        // >= 1 ms: display in milliseconds
        return `${valueInMs.toFixed(2)} ms`;
    } else if (valueInMs >= 0.001) {
        // >= 1 µs: display in microseconds
        const valueInUs = valueInMs * 1000;
        return `${valueInUs.toFixed(2)} µs`;
    } else {
        // < 1 µs: display in nanoseconds
        const valueInNs = valueInMs * 1000000;
        return `${valueInNs.toFixed(0)} ns`;
    }
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

    text.textContent = formatLatency(value);
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

    // Update bandwidth gauge
    const gaugeBar = document.getElementById('bandwidth-gauge-bar');
    const gaugeText = document.getElementById('bandwidth-gauge-text');
    const bandwidthPercent = document.getElementById('bandwidth-percent');

    bandwidthPercent.textContent = percentUsed.toFixed(3) + '%';

    // Set width
    gaugeBar.style.width = Math.min(100, percentUsed) + '%';

    // Color coding
    let gaugeColor = '';
    if (percentUsed >= 80) {
        gaugeColor = 'bg-red-500 dark:bg-red-600';
        gaugeText.textContent = 'CRITICAL';
    } else if (percentUsed >= 50) {
        gaugeColor = 'bg-orange-500 dark:bg-orange-600';
        gaugeText.textContent = 'HIGH';
    } else if (percentUsed >= 20) {
        gaugeColor = 'bg-yellow-500 dark:bg-yellow-600';
        gaugeText.textContent = 'MODERATE';
    } else {
        gaugeColor = 'bg-emerald-500 dark:bg-emerald-600';
        gaugeText.textContent = 'LOW';
    }

    gaugeBar.className = `h-full transition-all duration-300 flex items-center justify-end pr-2 ${gaugeColor}`;
}

/**
 * Updates port display according to protocol
 */
export function updatePortInfo() {
    const portDisplay = document.getElementById('port-display');
    portDisplay.textContent = state.protocol === 'aes67' ? 'RTP 5004' : 'UDP 4321';
}

/**
 * Updates overhead visualization
 * @param {Object} overheadBreakdown - Breakdown of overhead components
 * @param {number} totalPacketSize - Total packet size
 */
export function updateOverheadVisualization(overheadBreakdown, totalPacketSize) {
    const container = document.getElementById('overhead-visualization');

    const components = [
        { name: 'Audio Payload', size: overheadBreakdown.payload, color: 'bg-violet-500 dark:bg-violet-600' },
        { name: 'Ethernet + FCS', size: overheadBreakdown.ethernet, color: 'bg-slate-400 dark:bg-slate-600' },
        { name: 'IP Header', size: overheadBreakdown.ip, color: 'bg-blue-400 dark:bg-blue-700' },
        { name: 'UDP Header', size: overheadBreakdown.udp, color: 'bg-emerald-400 dark:bg-emerald-700' }
    ];

    if (overheadBreakdown.rtp > 0) {
        components.push({
            name: 'RTP Header',
            size: overheadBreakdown.rtp,
            color: 'bg-amber-400 dark:bg-amber-700'
        });
    }

    let html = '<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 flex overflow-hidden mb-3">';

    components.forEach(comp => {
        const percentage = (comp.size / totalPacketSize) * 100;
        html += `<div class="${comp.color} flex items-center justify-center text-xs font-semibold text-white"
                     style="width: ${percentage}%;"
                     title="${comp.name}: ${comp.size}B (${percentage.toFixed(1)}%)">
                     ${percentage > 8 ? comp.size + 'B' : ''}
                 </div>`;
    });

    html += '</div><div class="space-y-1">';

    components.forEach(comp => {
        const percentage = (comp.size / totalPacketSize) * 100;
        html += `<div class="flex items-center justify-between text-xs">
                     <div class="flex items-center gap-2">
                         <div class="w-3 h-3 rounded ${comp.color}"></div>
                         <span class="text-gray-700 dark:text-gray-300">${comp.name}</span>
                     </div>
                     <span class="font-mono text-gray-600 dark:text-gray-400">${comp.size}B (${percentage.toFixed(1)}%)</span>
                 </div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Updates network capacity display
 * @param {number} bandwidth - Current stream bandwidth
 * @param {number} maxStreams - Maximum concurrent streams
 * @param {number} recommendedStreams - Recommended streams (80%)
 */
export function updateNetworkCapacity(bandwidth, maxStreams, recommendedStreams) {
    const container = document.getElementById('network-capacity');

    const utilizationPercent = (bandwidth / 1000) * 100;

    let html = `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">This Stream Uses</div>
            <div class="text-2xl font-bold text-slate-700 dark:text-slate-300">${bandwidth.toFixed(2)} Mbps</div>
            <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">${utilizationPercent.toFixed(3)}% of 1 Gbps</div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Max Streams</div>
                <div class="text-xl font-bold text-slate-700 dark:text-slate-300">${maxStreams}</div>
                <div class="text-xs text-gray-500 dark:text-gray-500">100% capacity</div>
            </div>
            <div class="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div class="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Recommended</div>
                <div class="text-xl font-bold text-emerald-700 dark:text-emerald-400">${recommendedStreams}</div>
                <div class="text-xs text-emerald-600 dark:text-emerald-500">80% capacity</div>
            </div>
        </div>

        <div class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <strong>Note:</strong> Leaving 20% headroom allows for control traffic,
            PTP synchronization, and network overhead.
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Updates packet loss impact display
 * @param {number} packetsPerSecond - Current PPS
 * @param {number} packetizationLatency - Latency per packet in ms
 */
export function updatePacketLossImpact(packetsPerSecond, packetizationLatency) {
    const container = document.getElementById('packet-loss-impact');
    const lossRate = state.packetLoss;

    if (lossRate === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500 dark:text-gray-500">
                <div class="mb-2">✓ Perfect network - No packet loss</div>
                <div class="text-xs">Adjust the slider above to simulate packet loss</div>
            </div>
        `;
        return;
    }

    const packetsLostPerSecond = (packetsPerSecond * lossRate) / 100;
    const audioLostPerSecond = packetsLostPerSecond * packetizationLatency;
    const timeBetweenLosses = lossRate > 0 ? 1 / packetsLostPerSecond : Infinity;

    let severity = 'low';
    let severityColor = 'amber';
    let severityText = 'Noticeable';

    if (lossRate >= 1) {
        severity = 'high';
        severityColor = 'red';
        severityText = 'Severe';
    } else if (lossRate >= 0.5) {
        severity = 'medium';
        severityColor = 'orange';
        severityText = 'Significant';
    }

    let html = `
        <div class="bg-${severityColor}-50 dark:bg-${severityColor}-900/20 border border-${severityColor}-200 dark:border-${severityColor}-800 p-3 rounded-lg mb-3">
            <div class="font-semibold text-sm text-${severityColor}-800 dark:text-${severityColor}-400 mb-1">
                ${severityText} Impact
            </div>
            <div class="text-xs text-${severityColor}-700 dark:text-${severityColor}-400">
                ${lossRate}% loss rate will cause audible artifacts
            </div>
        </div>

        <div class="space-y-2">
            <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Packets lost per second:</span>
                <span class="font-mono font-semibold text-gray-800 dark:text-gray-200">${packetsLostPerSecond.toFixed(2)}</span>
            </div>

            <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Audio lost per second:</span>
                <span class="font-mono font-semibold text-gray-800 dark:text-gray-200">${audioLostPerSecond.toFixed(2)} ms</span>
            </div>

            <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Avg time between losses:</span>
                <span class="font-mono font-semibold text-gray-800 dark:text-gray-200">${timeBetweenLosses.toFixed(2)} s</span>
            </div>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
            Each lost packet = <strong>${packetizationLatency.toFixed(2)} ms</strong> of missing audio
            (${state.samplesPerPacket} samples × ${state.channels} channels)
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Updates configuration status with smart visual indicators
 * @param {Object} results - Calculation results
 */
export function updateConfigStatus(results) {
    const container = document.getElementById('config-status');
    const { totalLatency, bandwidth, mtuExceeded } = results;

    const issues = [];
    let status = 'optimal'; // optimal, acceptable, problematic
    let statusIcon = '🟢';
    let statusText = 'Optimal';
    let statusColor = 'emerald';

    // Check latency
    if (totalLatency > 10) {
        issues.push({ severity: 'high', text: `High latency (${formatLatency(totalLatency)})` });
        status = 'problematic';
    } else if (totalLatency > 5) {
        issues.push({ severity: 'medium', text: `Moderate latency (${formatLatency(totalLatency)})` });
        if (status === 'optimal') status = 'acceptable';
    }

    // Check bandwidth utilization
    const bandwidthPercent = (bandwidth / 1000) * 100;
    if (bandwidthPercent > 80) {
        issues.push({ severity: 'high', text: `High bandwidth usage (${bandwidthPercent.toFixed(1)}%)` });
        status = 'problematic';
    } else if (bandwidthPercent > 50) {
        issues.push({ severity: 'medium', text: `Moderate bandwidth usage (${bandwidthPercent.toFixed(1)}%)` });
        if (status === 'optimal') status = 'acceptable';
    }

    // Check MTU
    if (mtuExceeded) {
        issues.push({ severity: 'high', text: 'Packet exceeds MTU (fragmentation risk)' });
        status = 'problematic';
    }

    // Check packet loss
    if (state.packetLoss > 0.1) {
        issues.push({ severity: 'high', text: `Packet loss too high (${state.packetLoss.toFixed(1)}%)` });
        status = 'problematic';
    } else if (state.packetLoss > 0) {
        issues.push({ severity: 'medium', text: `Some packet loss (${state.packetLoss.toFixed(1)}%)` });
        if (status === 'optimal') status = 'acceptable';
    }

    // Set status based on overall assessment
    if (status === 'problematic') {
        statusIcon = '🔴';
        statusText = 'Problematic';
        statusColor = 'red';
    } else if (status === 'acceptable') {
        statusIcon = '🟡';
        statusText = 'Acceptable';
        statusColor = 'yellow';
    }

    let html = `
        <div class="flex items-center gap-3 p-4 rounded-lg bg-${statusColor}-50 dark:bg-${statusColor}-900/20 border-2 border-${statusColor}-400 dark:border-${statusColor}-600">
            <div class="text-4xl">${statusIcon}</div>
            <div class="flex-1">
                <div class="font-bold text-lg text-${statusColor}-800 dark:text-${statusColor}-400">${statusText}</div>
                <div class="text-sm text-${statusColor}-700 dark:text-${statusColor}-500">
                    ${status === 'optimal' ? 'Configuration meets professional AoIP standards' :
                      status === 'acceptable' ? 'Configuration functional but can be improved' :
                      'Configuration may cause audio issues'}
                </div>
            </div>
        </div>
    `;

    // Show issues if any
    if (issues.length > 0) {
        html += '<div class="mt-3 space-y-2">';
        issues.forEach(issue => {
            const icon = issue.severity === 'high' ? '⚠️' : '⚡';
            html += `
                <div class="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span>${icon}</span>
                    <span>${issue.text}</span>
                </div>
            `;
        });
        html += '</div>';
    }

    container.innerHTML = html;
}

/**
 * Updates packet journey timeline visualization
 * @param {Object} results - Calculation results
 */
export function updatePacketTimeline(results) {
    const container = document.getElementById('packet-timeline');
    const { packetizationLatency, networkLatency, totalLatency } = results;

    // Build journey stages
    const stages = [
        { name: 'Sender', latency: 0, icon: '📡', type: 'endpoint' },
        { name: 'Packetization', latency: packetizationLatency, icon: '📦', type: 'process' }
    ];

    // Add switches
    const latencyPerHop = networkLatency / state.hops;
    for (let i = 1; i <= state.hops; i++) {
        stages.push({
            name: `Switch ${i}`,
            latency: latencyPerHop,
            icon: '🔀',
            type: 'switch'
        });
    }

    // Add receiver
    stages.push({ name: 'Receiver', latency: 0, icon: '🎧', type: 'endpoint' });

    // Generate HTML
    let html = '<div class="flex items-center justify-between gap-2 overflow-x-auto pb-4">';

    stages.forEach((stage, index) => {
        // Stage node
        const isEndpoint = stage.type === 'endpoint';
        const bgColor = isEndpoint ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-blue-100 dark:bg-blue-900/30';
        const borderColor = isEndpoint ? 'border-violet-400 dark:border-violet-600' : 'border-blue-400 dark:border-blue-600';

        html += `
            <div class="flex flex-col items-center min-w-[80px] timeline-stage" style="animation: fadeIn 0.3s ease-in ${index * 0.1}s both">
                <div class="${bgColor} ${borderColor} border-2 rounded-lg p-3 text-center shadow-sm">
                    <div class="text-2xl mb-1">${stage.icon}</div>
                    <div class="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">${stage.name}</div>
                    ${stage.latency > 0 ? `<div class="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">${formatLatency(stage.latency)}</div>` : ''}
                </div>
            </div>
        `;

        // Arrow between stages (except after last)
        if (index < stages.length - 1) {
            html += `
                <div class="flex flex-col items-center">
                    <div class="text-2xl text-gray-400 dark:text-gray-600">→</div>
                </div>
            `;
        }
    });

    html += '</div>';

    // Add total summary
    html += `
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Journey Time:</span>
                <span class="text-lg font-bold text-violet-600 dark:text-violet-400">${formatLatency(totalLatency)}</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                TX Buffer: ${formatLatency(state.txBuffer)} + Jitter Buffer: ${formatLatency(state.jitterBuffer)}
            </div>
        </div>
    `;

    container.innerHTML = html;
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
    updateOverheadVisualization(results.overheadBreakdown, results.totalPacketSize);
    updateNetworkCapacity(results.bandwidth, results.maxStreams, results.recommendedStreams);
    updatePacketLossImpact(results.packetsPerSecond, results.packetizationLatency);
    updatePacketTimeline(results);
    updateConfigStatus(results);
}
