# AURA - Immersive Ambient Audio Synthesizer

AURA is an ultra-premium, 100% offline, interactive music playback and synthesis web application. It features Web Audio API sound engines that generate celestial space-ambient tracks in real-time, coupled with GPU-accelerated visualizations, live sound modulators, and an custom atmospheric track builder.

## Features

1. **Acoustic Propulsion Pipeline**: Real-time synthesizer engines using Web Audio nodes (lowpass filters, LFO frequency modulation sweep sweeps, and envelope triggers).
2. **Live Sound Modulation**: Drag controls directly on the playback deck to modulate wave timbre, fundamental base frequency, lowpass filter cutoff, and LFO sweeps dynamically as the audio plays.
3. **Atmospheric Synthesizer Builder**: Construct, specify, and queue your own custom space track profiles, defining unique waveforms, frequencies, and harmonic intervals.
4. **GPU-Accelerated Waveform Visualizations**: Clean, fluid waveforms running at 60 FPS utilizing HTML5 Canvas, synchronized with active synth oscillations.
5. **No AI Gating / Paywalls**: 100% unlocked client-side playback.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   `http://localhost:3000`

## Build for Production

1. Compile the production bundle:
   ```bash
   npm run build
   ```

2. Start the express production server:
   ```bash
   npm start
   ```
