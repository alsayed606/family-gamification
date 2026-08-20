const AVATARS = [
  "🙂", "😎", "🦊", "🐯", "🐼", "🦁",
  "🐨", "🐸", "🦄", "🐙", "🦋", "⭐",
  "🚀", "⚽", "🎨", "🎧", "📚", "🍉",
];

export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (avatar: string) => void;
}) {
  return (
    <div className="field">
      <span className="field-label">الرمز</span>
      <div className="avatar-grid" role="radiogroup" aria-label="اختر رمزًا">
        {AVATARS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={value === emoji}
            aria-label={`الرمز ${emoji}`}
            className={"avatar-option" + (value === emoji ? " is-selected" : "")}
            onClick={() => onChange(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export const DEFAULT_AVATAR = AVATARS[0]!;
