import { useState, useCallback, useRef, useEffect } from 'react';
import { VisualizationStep, ExecutionState } from '@/types/algorithm';

interface UseBattleEngineProps {
    stepsA: VisualizationStep[];
    stepsB: VisualizationStep[];
    speed: 'slow' | 'normal' | 'fast';
}

interface UseBattleEngineReturn {
    currentStepIndexA: number;
    currentStepIndexB: number;
    currentStepA: VisualizationStep | null;
    currentStepB: VisualizationStep | null;
    executionState: ExecutionState;
    winner: 'A' | 'B' | 'Tie' | null;
    progressA: number;
    progressB: number;
    run: () => void;
    pause: () => void;
    reset: () => void;
    step: () => void;
}

const SPEED_DELAYS = {
    slow: 200, // Faster than normal visualizer for battle pacing
    normal: 100,
    fast: 30,
};

export function useBattleEngine({
    stepsA,
    stepsB,
    speed,
}: UseBattleEngineProps): UseBattleEngineReturn {
    const [currentStepIndexA, setCurrentStepIndexA] = useState(-1);
    const [currentStepIndexB, setCurrentStepIndexB] = useState(-1);
    const [executionState, setExecutionState] = useState<ExecutionState>('idle');
    const [winner, setWinner] = useState<'A' | 'B' | 'Tie' | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        clearTimer();
        setCurrentStepIndexA(-1);
        setCurrentStepIndexB(-1);
        setExecutionState('idle');
        setWinner(null);
    }, [clearTimer]);

    const executeStep = useCallback(() => {
        let finishedA = false;
        let finishedB = false;

        // We process "one time unit" of comparison
        // In a real battle, one step might not equal one time unit if algorithms have different complexities per step
        // But for visualization, we can advance them 1:1 or weight them.
        // simpler approach: advance both 1 step per tick until they finish.

        setCurrentStepIndexA(prev => {
            if (prev < stepsA.length - 1) return prev + 1;
            finishedA = true;
            return prev;
        });

        setCurrentStepIndexB(prev => {
            if (prev < stepsB.length - 1) return prev + 1;
            finishedB = true;
            return prev;
        });

        // Check for completion
        // We need to know who finished *first* in terms of steps. 
        // Actually, checking 'finished' flags inside the setState callback is tricky because of closure.
        // Let's rely on the derived indices in the next effect or check differently.
    }, [stepsA.length, stepsB.length]);

    // Use an effect to handle the loop and winner determination to avoid closure staleness
    useEffect(() => {
        if (executionState !== 'running') return;

        const tick = () => {
            let nextA = currentStepIndexA;
            let nextB = currentStepIndexB;
            let hasNextA = currentStepIndexA < stepsA.length - 1;
            let hasNextB = currentStepIndexB < stepsB.length - 1;

            if (!hasNextA && !hasNextB) {
                setExecutionState('completed');
                // Winner logic: whoever has FEWER total steps typically "won" in efficiency (for these small inputs)
                // OR whoever finished *in time*.
                // If we step them 1:1, the one with fewer steps finishes first.
                if (stepsA.length < stepsB.length) setWinner('A');
                else if (stepsB.length < stepsA.length) setWinner('B');
                else setWinner('Tie');
                return;
            }

            if (hasNextA) nextA++;
            if (hasNextB) nextB++;

            setCurrentStepIndexA(nextA);
            setCurrentStepIndexB(nextB);

            timeoutRef.current = setTimeout(tick, SPEED_DELAYS[speed]);
        };

        timeoutRef.current = setTimeout(tick, SPEED_DELAYS[speed]);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [executionState, currentStepIndexA, currentStepIndexB, stepsA.length, stepsB.length, speed]);


    const run = useCallback(() => {
        if (stepsA.length === 0 && stepsB.length === 0) return;
        setExecutionState('running');
    }, [stepsA.length, stepsB.length]);

    const pause = useCallback(() => {
        setExecutionState('paused');
        clearTimer();
    }, [clearTimer]);

    const step = useCallback(() => {
        setExecutionState('paused');
        clearTimer();

        // Manual step advances both by 1
        if (currentStepIndexA < stepsA.length - 1) setCurrentStepIndexA(p => p + 1);
        if (currentStepIndexB < stepsB.length - 1) setCurrentStepIndexB(p => p + 1);
    }, [currentStepIndexA, currentStepIndexB, stepsA.length, stepsB.length, clearTimer]);

    return {
        currentStepIndexA,
        currentStepIndexB,
        currentStepA: currentStepIndexA >= 0 ? stepsA[currentStepIndexA] : null,
        currentStepB: currentStepIndexB >= 0 ? stepsB[currentStepIndexB] : null,
        executionState,
        winner,
        progressA: stepsA.length ? ((currentStepIndexA + 1) / stepsA.length) * 100 : 0,
        progressB: stepsB.length ? ((currentStepIndexB + 1) / stepsB.length) * 100 : 0,
        run,
        pause,
        reset,
        step,
    };
}
