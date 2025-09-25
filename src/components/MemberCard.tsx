import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Member {
  id: string;
  name: string;
  age: number;
  startDate: string;
  lastSurveyDate: string;
  surveyCompliance: number; // percentage
  weightLoss: number; // pounds lost (negative = gained)
  initialWeight: number;
  currentWeight: number;
  riskLevel: "High" | "Medium" | "Low";
}

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      default:
        return "success";
    }
  };

  const getWeightTrendIcon = () => {
    if (member.weightLoss > 0) {
      return <TrendingDown className="h-4 w-4 text-success" />;
    } else if (member.weightLoss < 0) {
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    }
    return <div className="h-4 w-4" />; // Empty space for no change
  };

  const getComplianceIcon = () => {
    if (member.surveyCompliance >= 80) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (member.surveyCompliance >= 60) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{member.name}</h3>
            <p className="text-sm text-muted-foreground">Age {member.age} • Started {member.startDate}</p>
          </div>
          <Badge
            variant={getRiskBadgeVariant(member.riskLevel)}
            className={cn(
              "font-medium",
              member.riskLevel === "High" && "bg-destructive/10 text-destructive border-destructive/20",
              member.riskLevel === "Medium" && "bg-warning/10 text-warning border-warning/20",
              member.riskLevel === "Low" && "bg-success/10 text-success border-success/20"
            )}
          >
            {member.riskLevel} Risk
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Survey Compliance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Survey Compliance
            </div>
            <div className="flex items-center gap-2">
              {getComplianceIcon()}
              <span className="font-semibold">{member.surveyCompliance}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last survey: {member.lastSurveyDate}
            </p>
          </div>

          {/* Weight Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {getWeightTrendIcon()}
              Weight Progress
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-semibold",
                member.weightLoss > 0 ? "text-success" : "text-destructive"
              )}>
                {member.weightLoss > 0 ? `-${member.weightLoss}` : `+${Math.abs(member.weightLoss)}`} lbs
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {member.initialWeight} → {member.currentWeight} lbs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}