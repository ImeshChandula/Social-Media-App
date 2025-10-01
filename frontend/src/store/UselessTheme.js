import useThemeStore from "./themeStore";

const { isDarkMode } = useThemeStore();

<div
    className={`container-fluid vh-100 overflow-hidden ${isDarkMode ? "" : "bg-gray-100 text-black"}`}
>
</div>
