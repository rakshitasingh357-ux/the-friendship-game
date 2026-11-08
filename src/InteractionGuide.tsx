export type ProximityInteraction = {
  id: string;
  title: string;
  discovery: string;
  instruction: string;
  control: string;
  x: number;
  y: number;
  detectionRadius: number;
  interactionRadius: number;
  onInteract?: () => void;
};

export function findNearestInteraction(
  interactions: ProximityInteraction[],
  position: { x: number; y: number },
) {
  const nearest = interactions
    .map((interaction) => ({
      interaction,
      distance: Math.hypot(position.x - interaction.x, position.y - interaction.y),
    }))
    .filter(({ interaction, distance }) => distance <= interaction.detectionRadius)
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest
    ? { ...nearest, inRange: nearest.distance <= nearest.interaction.interactionRadius }
    : null;
}

export default function InteractionGuide({
  title,
  discovery,
  instruction,
  control,
  inRange,
  tone = "default",
  onInteract,
  showTouchButton = true,
}: {
  title: string;
  discovery: string;
  instruction: string;
  control: string;
  inRange: boolean;
  tone?: "default" | "haunted" | "meadow" | "arcade";
  onInteract?: () => void;
  showTouchButton?: boolean;
}) {
  return (
    <aside className={`interaction-guide interaction-guide-${tone} ${inRange ? "in-range" : ""}`} role="status" aria-live="polite">
      <span className="interaction-guide-icon" aria-hidden="true">✦</span>
      <div className="interaction-guide-copy">
        <strong>{title}</strong>
        <p>{inRange ? instruction : discovery}</p>
        <span className="interaction-guide-control">{inRange ? control : "MOVE CLOSER"}</span>
      </div>
      {showTouchButton && inRange && onInteract && (
        <button type="button" className="interaction-guide-touch" onClick={onInteract}>
          INTERACT
        </button>
      )}
    </aside>
  );
}
