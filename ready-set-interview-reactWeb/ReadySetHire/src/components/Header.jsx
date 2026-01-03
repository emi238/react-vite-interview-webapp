import { NavLink, useNavigate} from "react-router-dom";

/**
 * Header component with navigation and page title section
 * Provides a consistent header across pages with dynamic content and navigation
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Main title to display in the header
 * @param {string} props.subtitle - Subtitle text below the main title
 * @param {string} props.buttonText - Text for the action button (optional)
 * @param {boolean} [props.showInterviewsButton=true] - Whether to show the Interviews navigation button
 * 
 * @returns {JSX.Element} - Rendered header component with navigation and title section
 */
function Header({ title, subtitle, buttonText, showInterviewsButton = true }) {
  // Function to determine the route based on button text
  const getButtonRoute = () => {
    const text = buttonText?.toLowerCase() || "";
    if (text.includes("back")) return "/interviews";
    if (text.includes("interview")) return "/createinterview";
    return "/";
  };
  
  const navigate = useNavigate();
  
  // Navigates to the interviews page
  const goToInterviews = () => {
    navigate('/interviews');
  };

  return (
    <header className="bg-headerblue text-white">
      {/* Navbar */}
      <div className="navbar bg-headerblue px-6 py-8 h-24 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="navbar-start">
            <button 
              onClick={goToInterviews}
              className="text-4xl font-bold text-white">
              <h1>ReadySetHire</h1></button>
          </div>

          <div className="navbar-end">
            {showInterviewsButton && (
              <div className="flex gap-2">
                <NavLink 
                  to="/interviews"
                  className="btn btn-lg rounded-lg px-8 outline outline-[0.5px] outline-white text-white bg-button-active hover:bg-button-hover transition-colors duration-200"
                >
                  <h1 className="text-2xl">Interviews</h1>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Title Section */}
      <div className="bg-page-primary px-6 py-4 rounded-t-3xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-md">{subtitle}</p>
          </div>

          {buttonText && (
            <NavLink 
              to={getButtonRoute()}
              className="btn btn-primary btn-lg rounded-lg px-2 outline outline-[0.5px] outline-white"
            >
              <div className="flex items-center">
                <h1 className="text-xl">{buttonText}</h1>   
              </div>
            </NavLink>
          )}
        </div>
      </div> 
    </header>
  );
}

export default Header;