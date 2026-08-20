import { Link } from "react-router-dom";

/**
 * شاشات الخطوة 3 هيكلية فقط: الغرض إثبات أن التوجيه والحراسة يعملان.
 * تُملأ بالمنطق الحقيقي في الخطوات 4–6.
 */
export function Placeholder({
  title,
  note,
  step,
}: {
  title: string;
  note: string;
  step: string;
}) {
  return (
    <div className="center-screen">
      <div className="card narrow">
        <h2>{title}</h2>
        <p className="muted">{note}</p>
        <p className="tag">قيد الإنشاء — {step}</p>
        <Link className="btn-ghost" to="/hub">
          العودة إلى الألعاب
        </Link>
      </div>
    </div>
  );
}
