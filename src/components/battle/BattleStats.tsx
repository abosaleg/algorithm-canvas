import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BattleStatsProps {
    algorithmA: string;
    algorithmB: string;
    stepsA: number;
    stepsB: number;
    inputSize: number;
    progressA: number;
    progressB: number;
    showMemory: boolean;
}

// Simple estimated complexity for demo purposes
// In a real app, this would be more rigorous
const getComplexityData = (algo: string, n: number) => {
    if (algo.includes('Bubble') || algo.includes('Insertion') || algo.includes('Selection')) return n * n;
    if (algo.includes('Merge') || algo.includes('Quick') || algo.includes('Heap')) return n * Math.log2(n);
    return n;
};

// Memory stack approximation
const getMemoryUsage = (algo: string, n: number) => {
    if (algo.includes('Merge')) return { stack: Math.log2(n), aux: n }; // O(n) aux
    if (algo.includes('Quick')) return { stack: Math.log2(n), aux: 0 }; // O(log n) stack
    if (algo.includes('Bubble') || algo.includes('Insertion')) return { stack: 1, aux: 0 }; // O(1)
    return { stack: 1, aux: 0 };
};

export function BattleStats({
    algorithmA,
    algorithmB,
    stepsA,
    stepsB,
    inputSize,
    progressA,
    progressB,
    showMemory
}: BattleStatsProps) {

    // Custom SVG Graph Data Generation
    const graphPoints = useMemo(() => {
        // We plot 0 to 50 input size for the background "curve"
        const points = [];
        const width = 300;
        const height = 150;
        const maxX = 50;
        const maxY = 2500; // n^2 for 50 is 2500

        for (let i = 0; i <= maxX; i += 5) {
            const x = (i / maxX) * width;

            const yA = height - (getComplexityData(algorithmA, i) / maxY) * height;
            const yB = height - (getComplexityData(algorithmB, i) / maxY) * height;

            points.push({ x, yA, yB, i });
        }
        return points;
    }, [algorithmA, algorithmB]);

    const memA = getMemoryUsage(algorithmA, inputSize);
    const memB = getMemoryUsage(algorithmB, inputSize);

    // Normalize memory for visualization (max bar width)
    const maxMem = Math.max(memA.stack + memA.aux, memB.stack + memB.aux, 1);
    const memPercA = ((memA.stack + memA.aux) / maxMem) * 100;
    const memPercB = ((memB.stack + memB.aux) / maxMem) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dynamic Big-O Graph */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Time Complexity Growth</CardTitle>
                    <CardDescription>Theoretical Operations vs Input Size</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative h-[150px] w-full">
                        <svg width="100%" height="100%" viewBox="0 0 300 150" className="overflow-visible">
                            {/* Grid Lines */}
                            <line x1="0" y1="150" x2="300" y2="150" className="stroke-muted-foreground/20" strokeWidth="1" />
                            <line x1="0" y1="0" x2="0" y2="150" className="stroke-muted-foreground/20" strokeWidth="1" />

                            {/* Path A */}
                            <path
                                d={`M ${graphPoints.map(p => `${p.x},${p.yA}`).join(' L ')}`}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                className="opacity-80"
                            />
                            {/* Path B */}
                            <path
                                d={`M ${graphPoints.map(p => `${p.x},${p.yB}`).join(' L ')}`}
                                fill="none"
                                stroke="hsl(var(--secondary))"
                                strokeWidth="2"
                                className="opacity-80"
                            />

                            {/* Current Input Marker */}
                            {graphPoints.length > 0 && (
                                <line
                                    x1={(inputSize / 50) * 300}
                                    y1="0"
                                    x2={(inputSize / 50) * 300}
                                    y2="150"
                                    stroke="currentColor"
                                    strokeDasharray="4"
                                    className="text-muted-foreground opacity-50"
                                />
                            )}
                        </svg>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Size: 0</span>
                            <span>Current: {inputSize}</span>
                            <span>Size: 50</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                                <span>{algorithmA}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                                <span>{algorithmB}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Relative Memory Usage</CardTitle>
                    <CardDescription>Estimated Stack + Auxiliary Space</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>{algorithmA}</span>
                            <span className="text-muted-foreground">
                                {memA.aux > 0 ? `Stack + O(${memA.aux}) Aux` : 'Stack Only'}
                            </span>
                        </div>
                        <Progress value={memPercA} className="h-2 bg-primary/20" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>{algorithmB}</span>
                            <span className="text-muted-foreground">
                                {memB.aux > 0 ? `Stack + O(${memB.aux}) Aux` : 'Stack Only'}
                            </span>
                        </div>
                        <Progress value={memPercB} className="h-2 bg-secondary/20 [&>div]:bg-secondary" />
                    </div>

                    <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-2 rounded">
                        * Memory values are educational approximations demonstrating relative scale (e.g., O(n) vs O(1)), not actual byte usage.
                    </div>
                </CardContent>
            </Card>

            {/* Live Step Counter */}
            <Card className="md:col-span-2">
                <CardContent className="pt-6 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-primary">{stepsA}</div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Steps (A)</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-secondary">{stepsB}</div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Steps (B)</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
