import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_STATES, STORAGE_KEYS } from '../game/constants.js';
import { GameEngine } from '../game/gameEngine.js';

export function useGame() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
    } catch {
      return false;
    }
  });

  // Handle score update callback from engine
  const handleScoreUpdate = useCallback((newScore) => {
    setScore(newScore);
    setBestScore((prevBest) => {
      if (newScore > prevBest) {
        try {
          localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(newScore));
        } catch (e) {
          // ignore
        }
        return newScore;
      }
      return prevBest;
    });
  }, []);

  // Handle game over callback
  const handleGameOver = useCallback(({ score: finalScore, bestScore: currentBest }) => {
    setScore(finalScore);
    setBestScore(currentBest);
    setGameState(GAME_STATES.GAME_OVER);
  }, []);

  // Handle state changes from engine
  const handleStateChange = useCallback((newState) => {
    setGameState(newState);
  }, []);

  // Initialize GameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine({
      canvas,
      onScoreUpdate: handleScoreUpdate,
      onGameOver: handleGameOver,
      onStateChange: handleStateChange,
      initialBestScore: bestScore,
      initialMuted: isMuted
    });

    engineRef.current = engine;

    // Start background render loop
    engine.loop(performance.now());

    // Window resize handler
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.setupViewport();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [handleScoreUpdate, handleGameOver, handleStateChange]);

  // Jump action
  const jump = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.jump();
    }
  }, []);

  // Start / Play action
  const startGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  // Pause action
  const pauseGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
  }, []);

  // Resume action
  const resumeGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  // Restart after game over
  const restartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  // Return to main menu
  const goToMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      engineRef.current.setState(GAME_STATES.MENU);
    }
  }, []);

  // Toggle audio mute
  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (engineRef.current && engineRef.current.audio) {
        engineRef.current.audio.setMuted(nextMuted);
      }
      try {
        localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(nextMuted));
      } catch (e) {
        // ignore
      }
      return nextMuted;
    });
  }, []);

  return {
    canvasRef,
    gameState,
    score,
    bestScore,
    isMuted,
    jump,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    goToMenu,
    toggleSound
  };
}

