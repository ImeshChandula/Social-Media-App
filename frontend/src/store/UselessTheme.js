import useThemeStore from "./themeStore";

const { isDarkMode } = useThemeStore();

<div
    className={`container-fluid vh-100 overflow-hidden ${isDarkMode ? "" : "bg-gray-100 text-black"}`}
>
</div>

{/* 
    Prompt for chatGPT
    
    Use tailwindcss to only change the parts that are related to darkmode lightmod (text colors, background colors). Do not change any other design. Also, provide a toggle next to the search button.
*/}