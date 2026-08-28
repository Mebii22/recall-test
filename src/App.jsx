import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Revision from "./pages/Revision";
import History from "./pages/History";
import Build from "./pages/Build";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>

      {/* NAVBAR */}
      <Navbar />

      {/* PAGES */}
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/topics"
          element={<Topics />}
        />

        <Route
          path="/test"
          element={<Test />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/revision"
          element={<Revision />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/build"
          element={<Build />}
        />

        <Route
          path="/about"
          element={<About />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;