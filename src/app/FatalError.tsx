/**
 * شاشة عطل الإقلاع.
 *
 * ⚠️ لا تستورد هذه الوحدة أي شيء من lib/firebase — فهي تُعرض تحديدًا حين
 * يفشل إقلاع Firebase، فاستيراده هنا يعني فشلها هي أيضًا وشاشة بيضاء.
 */
export function FatalError({ message }: { message: string }) {
  return (
    <div className="center-screen">
      <div className="card narrow">
        <span className="logo-emoji">🧩</span>
        <h2>تعذّر تشغيل التطبيق</h2>
        <p className="muted small">{message}</p>
        <p className="muted small">
          إن كنت المسؤول عن النشر: تأكّد من ضبط متغيّرات <code>VITE_FIREBASE_*</code>
          في إعدادات المستودع قبل البناء. راجع <code>docs/DEPLOY.md</code>.
        </p>
        <button className="btn" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
