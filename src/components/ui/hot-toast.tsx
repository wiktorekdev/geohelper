import { Toaster as HotToaster } from "react-hot-toast"

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      containerStyle={{ top: 8 }}
      toastOptions={{
        style: {
          background: "rgba(9, 9, 11, 0.92)",
          color: "rgb(244, 244, 245)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "24px",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "12px",
          fontWeight: 500,
          minWidth: "170px",
          maxWidth: "min(420px, calc(100vw - 32px))",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0f1712",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#1b0f0f",
          },
        },
      }}
    />
  )
}
