import { createContext, useContext } from "react";

export const ThemeContext = createContext<{ theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void }>({
    theme: "light",
    setTheme: () => {},
});

export const useTheme = () => {
    return useContext(ThemeContext);
}
