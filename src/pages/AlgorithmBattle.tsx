import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useTheme } from '@/hooks/use-theme';
import { BattleSetup } from '@/components/battle/BattleSetup';
import { BattleStats } from '@/components/battle/BattleStats';
import { useBattleEngine } from '@/hooks/useBattleEngine';
import { getBattleInput } from '@/lib/battle-utils';
import { bubbleSortRunner, selectionSortRunner, insertionSortRunner, mergeSortRunner, quickSortRunner, SortingInput } from '@/algorithms/runners/sorting';
import { AlgorithmRunner, VisualizationStep } from '@/types/algorithm';
import { ArrayVisualizer } from '@/components/visualizer/ArrayVisualizer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Info, MapPin } from 'lucide-react';

const RUNNERS_MAP: Record<string, AlgorithmRunner<SortingInput>> = {
    'bubble-sort': bubbleSortRunner,
    'selection-sort': selectionSortRunner,
    'insertion-sort': insertionSortRunner,
    'merge-sort': mergeSortRunner,
    'quick-sort': quickSortRunner,
};

export default function AlgorithmBattle() {
    const { theme } = useTheme(); // Ensuring theme context is active if needed for child components
    const [algoA, setAlgoA] = useState('bubble-sort');
    const [algoB, setAlgoB] = useState('quick-sort');
    const [inputSize, setInputSize] = useState(20);
    const [dataShape, setDataShape] = useState('random');

    const [inputData, setInputData] = useState<SortingInput>({ array: [] });

    // Keep track of the steps independently so they update when *Configuration* changes
    const [stepsA, setStepsA] = useState<VisualizationStep[]>([]);
    const [stepsB, setStepsB] = useState<VisualizationStep[]>([]);

    // Initialize or Update Input on Config Change ("Change One Thing" Mode)
    useEffect(() => {
        const newData = getBattleInput(dataShape as any, inputSize);
        setInputData({ array: newData.array });

        // Instantly regenerate steps for the new input
        // This allows the engine to be "reset" implicitly by the new props, 
        // but we need to notify the engine to re-run or just show the initial state.
        // For a smooth UX, we'll auto-generate the steps.
        const runnerA = RUNNERS_MAP[algoA];
        const runnerB = RUNNERS_MAP[algoB];

        if (runnerA && runnerB) {
            setStepsA(runnerA.generateSteps({ array: [...newData.array] }));
            setStepsB(runnerB.generateSteps({ array: [...newData.array] }));
        }
    }, [inputSize, dataShape, algoA, algoB]);

    const {
        currentStepA,
        currentStepB,
        currentStepIndexA,
        currentStepIndexB,
        executionState,
        winner,
        progressA,
        progressB,
        run,
        pause,
        reset,
        step
    } = useBattleEngine({
        stepsA,
        stepsB,
        speed: 'normal'
    });

    // Effect to auto-reset engine when input changes deeply?
    // Actually useBattleEngine resets when steps length changes significantly or we can force it.
    // The hook does `useEffect(() => stepsRef.current = steps, [steps])` but doesn't auto-reset execution index 
    // unless we tell it to. For "Change One Thing", we probably want to reset to start 
    // if the user moves the slider, OR we can try to "Hot Swap" but that's complex for algorithms.
    // Let's AUTO-RESET on config change to be safe and clear.
    useEffect(() => {
        reset();
    }, [stepsA, stepsB, reset]);


    return (
        <div className="min-h-screen bg-background">
            <Navbar onMenuToggle={() => { }} showMenuButton={false} />

            <main className="container mx-auto px-4 pt-20 pb-12">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Algorithm Battle Arena
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Compare algorithms side-by-side. See how they race, analyze their memory usage, and understand why one is faster than the other.
                    </p>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="mt-4">
                                <MapPin className="mr-2 h-4 w-4" />
                                Where is this used in real life?
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Real World Applications</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h3 className="font-semibold text-primary mb-1">Sorting (Bubble, Insertion)</h3>
                                    <p className="text-sm">Used in educational contexts and for very small datasets where code simplicity is preferred over speed.</p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h3 className="font-semibold text-secondary mb-1">Efficient Sorts (Quick, Merge)</h3>
                                    <p className="text-sm">Powering database indexing, e-commerce product listings, and large-scale data processing systems.</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Controls & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <BattleSetup
                            algoA={algoA}
                            algoB={algoB}
                            setAlgoA={setAlgoA}
                            setAlgoB={setAlgoB}
                            inputSize={inputSize}
                            setInputSize={setInputSize}
                            dataShape={dataShape}
                            setDataShape={setDataShape}
                            onStart={run}
                            isRunning={executionState === 'running'}
                            isPaused={executionState === 'paused'}
                            onPause={pause}
                            onReset={reset}
                        />

                        <BattleStats
                            algorithmA={algoA}
                            algorithmB={algoB}
                            stepsA={currentStepIndexA + 1}
                            stepsB={currentStepIndexB + 1}
                            inputSize={inputSize}
                            progressA={progressA}
                            progressB={progressB}
                            showMemory={true}
                        />

                        {winner && (
                            <div className="p-4 border-2 border-primary/50 bg-primary/10 rounded-xl animate-in fade-in zoom-in duration-500 text-center">
                                <h3 className="text-xl font-bold text-primary mb-2">
                                    {winner === 'Tie' ? "It's a Tie!" : `Winner: Algorithm ${winner}`}
                                </h3>
                                <p className="text-sm text-foreground/80">
                                    {winner === 'A' ? algoA : (winner === 'B' ? algoB : "Both")} finished sorting first!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: The Arena */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Arena A */}
                        <div className="relative group">
                            <div className="absolute top-2 left-2 z-10">
                                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded shadow-sm">
                                    Algorithm A: {algoA}
                                </span>
                            </div>
                            <div className="border border-primary/20 rounded-xl overflow-hidden bg-card/50 shadow-sm min-h-[300px] p-4">
                                {/* We reuse the ArrayVisualizer but need to clean it up lightly */}
                                <ArrayVisualizer
                                    currentStep={currentStepA || { kind: 'init', payload: { array: inputData.array || [] } }}
                                    className="h-[280px]"
                                />
                            </div>
                        </div>

                        {/* Arena B */}
                        <div className="relative group">
                            <div className="absolute top-2 left-2 z-10">
                                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded shadow-sm">
                                    Algorithm B: {algoB}
                                </span>
                            </div>
                            <div className="border border-secondary/20 rounded-xl overflow-hidden bg-card/50 shadow-sm min-h-[300px] p-4">
                                <ArrayVisualizer
                                    currentStep={currentStepB || { kind: 'init', payload: { array: inputData.array || [] } }}
                                    className="h-[280px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
