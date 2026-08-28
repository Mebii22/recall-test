import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  // Active navigation class
  const getNavClass = ({ isActive }) => {
    return isActive ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">

        {/* =========================================
            LOGO
        ========================================= */}

        <NavLink
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          RECALL<span>.</span>
        </NavLink>


        {/* =========================================
            MOBILE MENU BUTTON
        ========================================= */}

        <button
          type="button"
          className={`menu-toggle ${
            menuOpen ? "open" : ""
          }`}
          onClick={toggleMenu}
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* =========================================
            NAVIGATION LINKS
        ========================================= */}

        <div
          id="main-navigation"
          className={`navbar-links ${
            menuOpen ? "menu-open" : ""
          }`}
        >

          {/* HOME */}

          <NavLink
            to="/"
            end
            className={getNavClass}
            onClick={closeMenu}
          >
            HOME
          </NavLink>


          {/* TOPICS */}

          <NavLink
            to="/topics"
            className={getNavClass}
            onClick={closeMenu}
          >
            TOPICS
          </NavLink>


          {/* REVISION */}

          <NavLink
            to="/revision"
            className={getNavClass}
            onClick={closeMenu}
          >
            REVISION
          </NavLink>


          {/* HISTORY */}

          <NavLink
            to="/history"
            className={getNavClass}
            onClick={closeMenu}
          >
            HISTORY
          </NavLink>


          {/* BUILD */}

          <NavLink
            to="/build"
            className={getNavClass}
            onClick={closeMenu}
          >
            BUILD
          </NavLink>


          {/* ABOUT */}

          <NavLink
            to="/about"
            className={getNavClass}
            onClick={closeMenu}
          >
            ABOUT
          </NavLink>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;