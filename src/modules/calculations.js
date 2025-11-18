/**
 * Calculations Module - All packet, latency and bandwidth calculations
 * @module calculations
 */

import { state, SIZES } from './state.js';

/**
 * Calculates audio payload size in bytes
 * @returns {number} Size in bytes
 */
export function calculatePayloadSize() {
    // Formula: Channels × Samples × (Bits / 8)
    return state.channels * state.samplesPerPacket * (state.bitDepth / 8);
}

/**
 * Calculates network header size
 * @returns {number} Total header size in bytes
 */
export function calculateHeaderSize() {
    return SIZES.ethernet + SIZES.ip + SIZES.udp +
           (state.protocol === 'aes67' ? SIZES.rtp : 0);
}

/**
 * Calculates total packet size (layer 2)
 * @param {number} payloadSize - Payload size
 * @returns {number} Total size in bytes
 */
export function calculateTotalPacketSize(payloadSize) {
    return SIZES.ethernet + SIZES.ip + SIZES.udp +
           (state.protocol === 'aes67' ? SIZES.rtp : 0) +
           payloadSize + SIZES.fcs;
}

/**
 * Calculates packet efficiency (payload / total ratio)
 * @param {number} payloadSize - Payload size
 * @param {number} totalSize - Total packet size
 * @returns {number} Efficiency percentage
 */
export function calculateEfficiency(payloadSize, totalSize) {
    return (payloadSize / totalSize) * 100;
}

/**
 * Checks if packet exceeds MTU
 * @param {number} totalSize - Total packet size
 * @returns {boolean} True if exceeds MTU
 */
export function exceedsMTU(totalSize) {
    return totalSize > SIZES.mtu;
}

/**
 * Calculates packetization latency in milliseconds
 * @returns {number} Latency in ms
 */
export function calculatePacketizationLatency() {
    // Formula: (Samples per packet / Sample rate) × 1000
    return (state.samplesPerPacket / state.sampleRate) * 1000;
}

/**
 * Calculates network latency in milliseconds
 * @returns {number} Latency in ms (0.1 ms per switch)
 */
export function calculateNetworkLatency() {
    return state.hops * 0.1;
}

/**
 * Calculates total end-to-end latency
 * @param {number} packetizationLatency - Packetization latency
 * @param {number} networkLatency - Network latency
 * @returns {number} Total latency in ms
 */
export function calculateTotalLatency(packetizationLatency, networkLatency) {
    return packetizationLatency + state.txBuffer + networkLatency + state.jitterBuffer;
}

/**
 * Calculates packets per second
 * @returns {number} Packets per second
 */
export function calculatePacketsPerSecond() {
    // Formula: Sample rate / Samples per packet
    return state.sampleRate / state.samplesPerPacket;
}

/**
 * Calculates bandwidth in Mbps
 * @param {number} totalPacketSize - Total packet size
 * @param {number} packetsPerSecond - Packets per second
 * @returns {number} Bandwidth in Mbps
 */
export function calculateBandwidth(totalPacketSize, packetsPerSecond) {
    // Formula: Packet size (bits) × Packets per second / 1,000,000
    return (totalPacketSize * 8 * packetsPerSecond) / 1000000;
}

/**
 * Performs all calculations and returns result object
 * @returns {Object} All calculated results
 */
export function performAllCalculations() {
    const payloadSize = calculatePayloadSize();
    const headerSize = calculateHeaderSize();
    const totalPacketSize = calculateTotalPacketSize(payloadSize);
    const efficiency = calculateEfficiency(payloadSize, totalPacketSize);
    const mtuExceeded = exceedsMTU(totalPacketSize);

    const packetizationLatency = calculatePacketizationLatency();
    const networkLatency = calculateNetworkLatency();
    const totalLatency = calculateTotalLatency(packetizationLatency, networkLatency);

    const packetsPerSecond = calculatePacketsPerSecond();
    const bandwidth = calculateBandwidth(totalPacketSize, packetsPerSecond);

    return {
        payloadSize,
        headerSize,
        totalPacketSize,
        efficiency,
        mtuExceeded,
        packetizationLatency,
        networkLatency,
        totalLatency,
        packetsPerSecond,
        bandwidth
    };
}
