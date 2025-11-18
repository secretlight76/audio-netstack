/**
 * State Management - Application state management
 * @module state
 */

/**
 * Global application state
 */
export const state = {
    protocol: 'aes67',
    sampleRate: 48000,
    bitDepth: 24,
    channels: 8,
    samplesPerPacket: 128,
    hops: 3,
    txBuffer: 0,
    jitterBuffer: 0,
    packetLoss: 0 // Percentage (0-5%)
};

/**
 * Network constants (sizes in bytes)
 */
export const SIZES = {
    ethernet: 14,      // Ethernet header
    fcs: 4,            // Frame Check Sequence (Ethernet)
    ip: 20,            // IPv4 header
    udp: 8,            // UDP header
    rtp: 12,           // RTP header (AES67 only)
    mtu: 1518          // Standard Ethernet MTU
};

/**
 * Protocol port configuration
 */
export const PROTOCOL_PORTS = {
    aes67: 'RTP 5004',
    dante: 'UDP 4321'
};
