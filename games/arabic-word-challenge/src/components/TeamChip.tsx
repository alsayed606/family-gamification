type TeamChipProps = {
  color: "blue" | "red";
  name: string;
  score: number;
  active: boolean;
  out: boolean;
  hotkey: string;
};

export function TeamChip({ color, name, score, active, out, hotkey }: TeamChipProps) {
  return (
    <div
      className={`team-chip ${color}${active ? " active" : ""}${out ? " out" : ""}`}
    >
      <span className="chip-name">{name}</span>
      <span className="chip-score">{score}</span>
      <span className="chip-key">مفتاح {hotkey}</span>
    </div>
  );
}
