import React from 'react';
import { useEffect, useState } from 'react';
import { BfsAlgorithm, DfsAlgorithm, FollowWallsAlgorithm, RandomAlgorithm } from './algorithms/algorithms';
import './App.css';
import Bot from './entities/bot';
import Environment from './entities/environment';
import Room from './entities/room';
import Trash from './entities/trash';
import { EnvironmentVisualization } from './konva/EnvironmentVisualization';

const sbEnvironment = new Environment({
  size: 20,
  bots: [
    new Bot({name: "blue", color: "blue", x: 13, y: 10, rotation: 'UP', visionRadius: 1, algorithm: DfsAlgorithm }),
  ],
  rooms: [
    new Room({width: 20, height: 19, x: 0, y: 0 }),
    new Room({width: 10, height: 7, x: 0, y: 0, doors: [{y:7, x: 4}, {y: 3, x: 9}]}),
    new Room({width: 10, height: 12, x: 0, y: 7, doors: [{y:7, x: 4}, {y: 13, x: 9}]})
  ],
  trash: [
    new Trash(5, 3),
    new Trash(5, 12),
    new Trash(15, 3)
  ],
  ga: false
});

const environment = new Environment({
  size: 20,
  bots: [
    new Bot({name: "blue", color: "blue", x: 13, y: 10, rotation: 'UP', visionRadius: 1, algorithm: DfsAlgorithm }),
    new Bot({name: "red", color: "red", x: 3, y: 15, rotation: 'UP', visionRadius: 1, algorithm: DfsAlgorithm }),
    new Bot({name: "green", color: "green", x: 6, y: 5, rotation: 'UP', visionRadius: 1, algorithm: DfsAlgorithm })
    //new Bot("green", 6, 5, 'UP')
  ],
  rooms: [
    new Room({width: 20, height: 19, x: 0, y: 0 }),
    new Room({width: 10, height: 7, x: 0, y: 0, doors: [{y:7, x: 4}, {y: 3, x: 9}]}),
    new Room({width: 10, height: 12, x: 0, y: 7, doors: [{y:7, x: 4}, {y: 13, x: 9}]})
  ],
  trash: [
    new Trash(5, 3),
    new Trash(5, 12),
    new Trash(15, 3)
  ],
  ga: false
});

const gaEnvironment = new Environment({
  size: 20,
  bots: [],
  rooms: [
    new Room({width: 20, height: 19, x: 0, y: 0 }),
    new Room({width: 10, height: 7, x: 0, y: 0, doors: [{y:7, x: 4}, {y: 3, x: 9}]}),
    new Room({width: 10, height: 12, x: 0, y: 7, doors: [{y:7, x: 4}, {y: 13, x: 9}]})
  ],
  trash: [
    new Trash(5, 3),
    new Trash(5, 12),
    new Trash(15, 3)
  ],
  ga: true,
  lifetime: 150,
  mutationRate: 0.2,
  populationSize: 20
});

interface SimilatorProps {
  env: Environment
  title: string
}

const Simulator: React.FC<SimilatorProps> = ({env, title}) => {
  const [running, setRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        env.progress();
        setProgress(progress + 1);
      }
    }, 10)
    return () => {
      clearInterval(interval);
    }
  }, [running, progress])

  return (
    <div className="Container">
      <div className="Control">
        <h3>{title}</h3>
        <button onClick={() => {
          env.progress();
          setProgress(progress + 1);
        }}>Next</button>
        <button onClick={() => {
          setRunning(true);
        }}>Play</button>
        <button onClick={() => {
          setRunning(false);
        }}>Stop</button>
      </div>
      <div className="Stage">
        <EnvironmentVisualization progress={progress} environment={env} />
      </div>
    </div>
  );
}

function App() {

  return (
    <div className="App">
      <Simulator title="Single bot DFS algorithm" env={sbEnvironment} />
      <Simulator title="Multibot DFS algorithm" env={environment} />
      <Simulator title="Genetic algorithm" env={gaEnvironment} />
    </div>
  );
}

export default App;
