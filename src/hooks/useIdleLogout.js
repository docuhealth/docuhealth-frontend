import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const IDLE_TIME = 1 * 60 * 1000; // 1 minute

export default function useIdleLogout() {
  const timer = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    sessionStorage.clear();
    queryClient.clear();
    navigate("/user-login");
  };

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      logout();
    }, IDLE_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}
