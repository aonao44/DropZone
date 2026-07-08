"use client";

// root layout の外側で描画されるため、Clerk やアプリの Provider に依存しない
// 最小構成にしている（ここに Clerk が入るとビルド時プリレンダーが壊れる）
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a, #000000, #1e293b)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontWeight: 200, fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            問題が発生しました
          </h1>
          <p style={{ color: "#94a3b8", fontWeight: 300, marginBottom: "1.5rem" }}>
            時間をおいて再度お試しください。
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#f1f5f9",
              color: "#0f172a",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
