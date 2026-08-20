type BannerProps = {
  kind: "error" | "success" | "info";
  children: React.ReactNode;
};

export function Banner({ kind, children }: BannerProps) {
  return (
    <p
      className={`banner banner-${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
