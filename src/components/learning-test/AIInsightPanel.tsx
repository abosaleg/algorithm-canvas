import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, BookOpen } from "lucide-react";
import { GeneratedProblem } from "@/hooks/useLearningTest";

interface AIInsightPanelProps {
    problem: GeneratedProblem;
    isCorrect: boolean;
}

export function AIInsightPanel({ problem, isCorrect }: AIInsightPanelProps) {
    return (
        <Card className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-orange-500'} bg-muted/40`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-orange-600'}`} />
                    AI Tutor Insight
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="leading-relaxed text-sm md:text-base">
                    {problem.explanation}
                </p>

                {/* Adaptive level content could be added here if the backend returns it broken down */}

                <div className="mt-4 p-3 bg-background rounded border text-sm flex gap-3">
                    <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold block mb-1">Key Takeaway</span>
                        Understanding the "shape" of your data (like {problem.input.length < 20 ? "small size" : "large size"}
                        or "nearly sorted") is crucial for picking the right tool.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
