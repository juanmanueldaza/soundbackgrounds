import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AudioManager,
  AudioAnalyzer,
  MockAudioAnalyzer,
} from "../audio/AudioManager";

describe("AudioManager", () => {
  let audioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  it("should create a mock analyzer in test mode", async () => {
    process.env.NODE_ENV = "test";
    const analyzer = await audioManager.initialize();
    expect(analyzer).toBeInstanceOf(AudioAnalyzer);

    const spectrum = analyzer.analyze();
    expect(Array.isArray(spectrum)).toBe(true);
    expect(spectrum.length).toBeGreaterThan(0);
  });
});
