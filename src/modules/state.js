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
    samplesPerPacket: 48, // AES67 and Dante standard packet time (1ms @ 48kHz)
    hops: 3,
    switchType: 'av-dedicated', // Switch type: 'cut-through', 'store-forward', 'av-dedicated'
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

/**
 * Switch latency per hop (in milliseconds)
 * Based on typical Gigabit Ethernet switch performance
 */
export const SWITCH_LATENCY = {
    'cut-through': 0.005,      // 5 µs - Fastest, forwards as soon as destination MAC is read
    'store-forward': 0.030,    // 30 µs - Receives entire frame, checks FCS, then forwards
    'av-dedicated': 0.010      // 10 µs - Optimized for audio/video (Dante, AES67 certified)
};
