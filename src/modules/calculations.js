/**
 * Calculations Module - Tous les calculs de paquets, latence et bande passante
 * @module calculations
 */

import { state, SIZES } from './state.js';

/**
 * Calcule la taille de la payload audio en octets
 * @returns {number} Taille en octets
 */
export function calculatePayloadSize() {
    // Formule : Canaux × Échantillons × (Bits / 8)
    return state.channels * state.samplesPerPacket * (state.bitDepth / 8);
}

/**
 * Calcule la taille des en-têtes réseau
 * @returns {number} Taille totale des en-têtes en octets
 */
export function calculateHeaderSize() {
    return SIZES.ethernet + SIZES.ip + SIZES.udp +
           (state.protocol === 'aes67' ? SIZES.rtp : 0);
}

/**
 * Calcule la taille totale du paquet (couche 2)
 * @param {number} payloadSize - Taille de la payload
 * @returns {number} Taille totale en octets
 */
export function calculateTotalPacketSize(payloadSize) {
    return SIZES.ethernet + SIZES.ip + SIZES.udp +
           (state.protocol === 'aes67' ? SIZES.rtp : 0) +
           payloadSize + SIZES.fcs;
}

/**
 * Calcule l'efficacité du paquet (ratio payload / total)
 * @param {number} payloadSize - Taille de la payload
 * @param {number} totalSize - Taille totale du paquet
 * @returns {number} Pourcentage d'efficacité
 */
export function calculateEfficiency(payloadSize, totalSize) {
    return (payloadSize / totalSize) * 100;
}

/**
 * Vérifie si le paquet dépasse le MTU
 * @param {number} totalSize - Taille totale du paquet
 * @returns {boolean} True si dépasse le MTU
 */
export function exceedsMTU(totalSize) {
    return totalSize > SIZES.mtu;
}

/**
 * Calcule la latence de paquetisation en millisecondes
 * @returns {number} Latence en ms
 */
export function calculatePacketizationLatency() {
    // Formule : (Échantillons par paquet / Taux d'échantillonnage) × 1000
    return (state.samplesPerPacket / state.sampleRate) * 1000;
}

/**
 * Calcule la latence réseau en millisecondes
 * @returns {number} Latence en ms (0.1 ms par switch)
 */
export function calculateNetworkLatency() {
    return state.hops * 0.1;
}

/**
 * Calcule la latence totale de bout en bout
 * @param {number} packetizationLatency - Latence de paquetisation
 * @param {number} networkLatency - Latence réseau
 * @returns {number} Latence totale en ms
 */
export function calculateTotalLatency(packetizationLatency, networkLatency) {
    return packetizationLatency + state.txBuffer + networkLatency + state.jitterBuffer;
}

/**
 * Calcule le nombre de paquets par seconde
 * @returns {number} Paquets par seconde
 */
export function calculatePacketsPerSecond() {
    // Formule : Taux d'échantillonnage / Échantillons par paquet
    return state.sampleRate / state.samplesPerPacket;
}

/**
 * Calcule la bande passante en Mbps
 * @param {number} totalPacketSize - Taille totale du paquet
 * @param {number} packetsPerSecond - Paquets par seconde
 * @returns {number} Bande passante en Mbps
 */
export function calculateBandwidth(totalPacketSize, packetsPerSecond) {
    // Formule : Taille du paquet (bits) × Paquets par seconde / 1 000 000
    return (totalPacketSize * 8 * packetsPerSecond) / 1000000;
}

/**
 * Effectue tous les calculs et retourne un objet avec les résultats
 * @returns {Object} Tous les résultats calculés
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
