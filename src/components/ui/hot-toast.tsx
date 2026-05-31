import { Toaster as HotToaster } from "react-hot-toast"

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      containerStyle={{ top: 8 }}
      toastOptions={{
        style: {
          background: "rgba(7, 7, 7, 0.92)",
          color: "rgb(250, 250, 250)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(18px)",
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "12px",
          fontWeight: 600,
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
