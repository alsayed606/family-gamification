import { Link, useRouteError } from "react-router-dom";

export function ErrorScreen({ notFound }: { notFound?: boolean }) {
  // useRouteError يعمل فقط داخل errorElement؛ في مسار * لا يوجد خطأ.
  const error = useRouteError() as { message?: string } | undefined;

  return (
    <div className="center-screen">
      <div className="card narrow">
        <h2>{notFound ? "الصفحة غير موجودة" : "حدث خطأ غير متوقّع"}</h2>
        {!notFound && error?.message && (
          <p className="muted mono">{error.message}</p>
        )}
        <Link className="btn" to="/hub">
          العودة إلى الألعاب
        </Link>
      </div>
    </div>
  );
}
