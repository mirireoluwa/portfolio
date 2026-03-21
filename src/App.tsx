import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProjectsProvider } from "./context/ProjectsContext";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";

function App() {
  return (
    <ProjectsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
        </Routes>
      </Layout>
    </ProjectsProvider>
  );
}

export default App;


