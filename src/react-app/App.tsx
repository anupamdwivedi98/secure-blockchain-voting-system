import { BrowserRouter as Router, Routes, Route } from "react-router";
import VotePage from "@/react-app/pages/VotePage";
import ResultsPage from "@/react-app/pages/ResultsPage";
import BlockchainPage from "@/react-app/pages/BlockchainPage";
import Layout from "@/react-app/components/Layout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<VotePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/blockchain" element={<BlockchainPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
