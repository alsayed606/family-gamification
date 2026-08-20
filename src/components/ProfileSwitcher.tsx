import { GUARDIAN_ID } from "../lib/activeProfile";
import type { ChildProfile } from "../types";

/**
 * مبدّل الملف النشط — عرض فقط.
 *
 * لا يترتّب على الاختيار أي صلاحية؛ راجع src/lib/activeProfile.ts.
 * الغرض أن يرى الطفل نفسه في الواجهة، لا أن يُفصل وصوله عن ولي أمره.
 */
export function ProfileSwitcher({
  guardian,
  profiles,
  activeId,
  onSelect,
}: {
  guardian: { displayName: string; avatar: string };
  profiles: ChildProfile[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (profiles.length === 0) return null;

  const options = [
    { id: GUARDIAN_ID, displayName: guardian.displayName, avatar: guardian.avatar },
    ...profiles,
  ];

  return (
    <section className="switcher" aria-label="من يلعب الآن">
      <span className="switcher-label">من يلعب الآن؟</span>
      <div className="switcher-chips" role="radiogroup" aria-label="اختر اللاعب">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={activeId === o.id}
            className={"chip" + (activeId === o.id ? " is-active" : "")}
            onClick={() => onSelect(o.id)}
          >
            <span className="chip-avatar">{o.avatar}</span>
            <span className="chip-name">{o.displayName}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
