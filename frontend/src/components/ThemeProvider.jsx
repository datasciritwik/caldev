import { createContext, useContext, useMemo } from "react";
import "./ThemeProvider.css";

// Default palette based on "Glowing horizon"
const defaultTheme = {
  colors: {
    primary: "#4272FF", // Blue
    secondary: "#42EAFF", // Cyan
    warning: "#FFB343", // Yellow
    danger: "#FF7E42", // Orange

    // Base colors
    background: "#ffffff",
    text: "#1a1a1a",
  },
};

const ThemeContext = createContext(defaultTheme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children, theme = defaultTheme }) => {
  const mergedTheme = useMemo(() => {
    return {
      ...defaultTheme,
      ...theme,
      colors: { ...defaultTheme.colors, ...(theme?.colors || {}) },
    };
  }, [theme]);

  // Generate CSS variables from the theme object
  // This allows us to use standard CSS var(--color-primary) anywhere inside the app
  const cssVariables = useMemo(() => {
    const vars = {};
    Object.entries(mergedTheme.colors).forEach(([key, value]) => {
      vars[`--color-${key}`] = value;
    });
    return vars;
  }, [mergedTheme]);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      <div className="theme-provider-wrapper" style={cssVariables}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
