import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Stars } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

type CelestialRealmProps = {
  onComplete: () => void;
  onMap: () => void;
  isMusicPanelOpen: boolean;
  onToggleMusicPanel: () => void;
};

const storyBeats = [
  {
    title: "THE SKY OPENS",
    text: "The sky opens its eyes. A forbidden oath stirs beneath the crimson moon.",
  },
  {
    title: "THE CELESTIAL GATE",
    text: "The celestial gate hums with ancient memory. Every step awakens a forgotten vow.",
  },
  {
    title: "THE HEAVENS REMEMBER",
    text: "The realm exhales. The heavens remember your name.",
  },
];

function CelestialScene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <group ref={group}>
      <Stars radius={80} depth={30} count={5000} factor={5} saturation={0} fade speed={0.8} />
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.2}>
        <mesh position={[0, 0.5, 0]}>
          <octahedronGeometry args={[2.2, 0]} />
          <meshStandardMaterial color="#ffd18a" emissive="#f6c85f" emissiveIntensity={1.2} metalness={0.75} roughness={0.2} />
        </mesh>
      </Float>
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#120d2a" metalness={0.5} roughness={0.8} />
      </mesh>
      {[[-5, 1.2, -2], [4.5, 0.8, 1], [-3, 2, 4], [5.5, 1.5, -4]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow>
          <boxGeometry args={[1.5, 2.8, 1.5]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#251b47" : "#312555"} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {[[-6, 0.6, -6], [6, 0.6, 5], [0, 2.3, -7]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]}>
          <torusGeometry args={[1.2, 0.14, 10, 30]} />
          <meshStandardMaterial color={index === 2 ? "#ff7c84" : "#8bd7ff"} emissive={index === 2 ? "#ff7c84" : "#5ea8ff"} emissiveIntensity={1.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function CelestialRealm({ onComplete, onMap, isMusicPanelOpen, onToggleMusicPanel }: CelestialRealmProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const beat = storyBeats[beatIndex];
  const isLastBeat = beatIndex === storyBeats.length - 1;

  return (
    <main className="celestial-story-screen screen">
      <Canvas className="celestial-story-canvas" camera={{ position: [0, 2.5, 12], fov: 42 }} shadows>
        <ambientLight intensity={0.6} color="#d6c7ff" />
        <directionalLight position={[4, 8, 5]} intensity={1.2} color="#f7d8ad" castShadow />
        <pointLight position={[0, 2.8, 0]} intensity={3.2} color="#ffcb78" />
        <Environment preset="night" />
        <CelestialScene />
      </Canvas>
      <div className="celestial-story-vignette" aria-hidden="true" />
      <header className="celestial-story-header">
        <div>
          <span>THE FRIENDSHIP GAME / FINAL STORY</span>
          <h1>CELESTIAL FINALE</h1>
        </div>
        <div className="celestial-story-controls">
          <button type="button" className="music-panel-toggle" onClick={onToggleMusicPanel} aria-expanded={isMusicPanelOpen} aria-label={isMusicPanelOpen ? "Close music controls" : "Open music controls"}>MUSIC</button>
          <button type="button" className="celestial-story-map" onClick={onMap}>WORLD MAP</button>
        </div>
      </header>
      <section key={beat.title} className="celestial-story-card" aria-live="polite">
        <span className="celestial-story-kicker">A STORY AFTER THE ADVENTURE</span>
        <div className="celestial-story-orb" aria-hidden="true"><i /></div>
        <span className="celestial-story-chapter">CHAPTER 0{beatIndex + 1} / 0{storyBeats.length}</span>
        <h2>{beat.title}</h2>
        <p>{beat.text}</p>
        <div className="celestial-story-progress" aria-label={`Story chapter ${beatIndex + 1} of ${storyBeats.length}`}>
          {storyBeats.map((storyBeat, index) => <i key={storyBeat.title} className={index <= beatIndex ? "active" : ""} />)}
        </div>
        <button type="button" className="celestial-story-continue" onClick={() => isLastBeat ? onComplete() : setBeatIndex((index) => index + 1)}>
          {isLastBeat ? "READ YOUR FINAL LETTER" : "CONTINUE THE STORY"}
        </button>
      </section>
      <div className="celestial-story-footer">THE REALM EXHALES. THE HEAVENS REMEMBER YOUR NAME.</div>
    </main>
  );
}
