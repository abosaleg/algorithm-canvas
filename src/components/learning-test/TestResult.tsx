import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { ArrayVisualizer } from "@/components/visualizer/ArrayVisualizer";
import { GeneratedProblem, AnswerStatus } from "@/hooks/useLearningTest";
import { bubbleSortRunner, mergeSortRunner, quickSortRunner, selectionSortRunner, insertionSortRunner } from '@/algorithms/runners/sorting';
import { AlgorithmRunner, VisualizationStep } from '@/types/algorithm';
import { AIInsightPanel } from "@/components/learning-test/AIInsightPanel";

interface TestResultProps {
    problem: GeneratedProblem;
    userChoice: string;
    result: AnswerStatus;
    onNext: () => void;
}

const RUNNERS: Record<string, AlgorithmRunner<any>> = {
    'bubble-sort': bubbleSortRunner,
    'merge-sort': mergeSortRunner,
    'quick-sort': quickSortRunner,
    'selection-sort': selectionSortRunner,
    'insertion-sort': insertionSortRunner,
};

export function TestResult({ problem, userChoice, result, onNext }: TestResultProps) {
    const [steps, setSteps] = useState<VisualizationStep[]>([]);
    const [currentStep, setCurrentStep] = useState<VisualizationStep | null>(null);

    useEffect(() => {
        // Generate simulation for the CHOSEN algorithm
        const runner = RUNNERS[userChoice];
        if (runner) {
            const generated = runner.generateSteps({ array: [...problem.input] });
            setSteps(generated);
            // Auto-play or just show end state? 
            // User request: "Show simulation until point of failure" or just run it.
            // For simplicity, let's just run it or show start.
            // Let's set it to valid start.
            if (generated.length > 0) setCurrentStep(generated[0]);
        }
    }, [userChoice, problem.input]);

    // Simple auto-play effect for demo
    useEffect(() => {
        if (steps.length === 0) return;
        let idx = 0;
        const interval = setInterval(() => {
            idx++;
            if (idx < steps.length) {
                setCurrentStep(steps[idx]);
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [steps]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className={`p-6 rounded-xl border-2 text-center ${result === 'correct' ? 'bg-green-500/10 border-green-500/50' :
                result === 'suboptimal' ? 'bg-yellow-500/10 border-yellow-500/50' :
                    'bg-red-500/10 border-red-500/50'
                }`}>
                <div className="flex justify-center mb-4">
                    {result === 'correct' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                    {result === 'suboptimal' && <AlertTriangle className="h-16 w-16 text-yellow-500" />}
                    {result === 'incorrect' && <XCircle className="h-16 w-16 text-red-500" />}
                </div>

                <h2 className="text-2xl font-bold mb-2">
                    {result === 'correct' ? 'Excellent Choice!' :
                        result === 'suboptimal' ? 'Correct, but not optimal' :
                            'Not quite right'}
                </h2>

                <div className="text-muted-foreground max-w-lg mx-auto mb-6 space-y-4">
                    {(result === 'suboptimal' || result === 'incorrect') && (
                        <div className="p-3 bg-muted rounded-lg border border-primary/20">
                            <span className="font-semibold text-foreground block mb-1">
                                Better Choice: <span className="text-primary">{problem.optimalAlgorithm}</span>
                            </span>
                        </div>
                    )}

                    <p>
                        {result === 'correct' ? problem.explanation :
                            result === 'suboptimal' ? `While ${userChoice} works, ${problem.optimalAlgorithm} is typically better here.` :
                                `This approach isn't ideal for this scenario.`}
                    </p>

                    <div className="text-left">
                        <AIInsightPanel problem={problem} isCorrect={result === 'correct' || result === 'suboptimal'} />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">Simulation: {userChoice}</h3>
                    <div className="w-full max-w-md h-[200px] border rounded-lg bg-background p-4 relative overflow-hidden">
                        <ArrayVisualizer currentStep={currentStep || { kind: 'init', payload: { array: problem.input } }} />
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button size="lg" onClick={onNext} className="gap-2">
                    Next Challenge <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
