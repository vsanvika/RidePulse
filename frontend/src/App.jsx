import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import Toast from "./components/Toast";
import { applyThemeClass, useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    applyThemeClass(theme);
    fetchMe();
  }, [theme, fetchMe]);

  return (
    <>
      <Toast />
      <AppRouter />
    </>
  );
}
