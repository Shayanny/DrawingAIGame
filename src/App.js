
import './App.css';
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";

function App() {
  return (
    <div className="flex flex-col items-center p-5">
    <h1 className="text-2xl font-bold mb-4">AI Drawing Game</h1>
    <Toolbar />
    <Canvas />
  </div>
  );
}

export default App;
