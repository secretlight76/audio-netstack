/**
 * State Management - Gestion de l'état de l'application
 * @module state
 */

/**
 * État global de l'application
 */
export const state = {
    protocol: 'aes67',
    sampleRate: 48000,
    bitDepth: 24,
    channels: 8,
    samplesPerPacket: 128,
    hops: 3,
    txBuffer: 1,
    jitterBuffer: 5
};

/**
 * Constantes réseau (tailles en octets)
 */
export const SIZES = {
    ethernet: 14,      // En-tête Ethernet
    fcs: 4,            // Frame Check Sequence (Ethernet)
    ip: 20,            // En-tête IPv4
    udp: 8,            // En-tête UDP
    rtp: 12,           // En-tête RTP (uniquement AES67)
    mtu: 1518          // MTU Ethernet standard
};

/**
 * Configuration des ports par protocole
 */
export const PROTOCOL_PORTS = {
    aes67: 'RTP 5004',
    dante: 'UDP 4321'
};
