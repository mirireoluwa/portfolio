import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { isAdminHostname } from "./config/site";
import { ProjectsProvider } from "./context/ProjectsContext";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";

function App() {
  const adminHost =
    typeof window !== "undefined" && isAdminHostname(window.location.hostname);

  return (
    <ProjectsProvider>
      <Layout>
        {adminHost ? (
          <Routes>
            <Route path="/" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
          </Routes>
        )}
      </Layout>
    </ProjectsProvider>
  );
}

export default App;


