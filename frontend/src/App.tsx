import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Chat App Homepage</div>} />
      </Routes>
    </Router>
  );
};

export default App;
