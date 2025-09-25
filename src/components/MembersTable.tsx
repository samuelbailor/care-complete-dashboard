import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingDown, TrendingUp, Calendar, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { MemberProfile } from "@/utils/csvParser";
import { cn } from "@/lib/utils";

interface MembersTableProps {
  members: MemberProfile[];
  onMemberClick?: (member: MemberProfile) => void;
}

export function MembersTable({ members, onMemberClick }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High": return "destructive";
      case "Medium": return "warning";
      default: return "success";
    }
  };

  const getWeightChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingDown className="h-4 w-4 text-success" />;
    } else if (change < 0) {
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    }
    return <div className="h-4 w-4" />;
  };

  const getComplianceIcon = (compliance: number) => {
    if (compliance >= 80) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (compliance >= 60) {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} members
          {searchQuery && (
            <span> for "{searchQuery}"</span>
          )}
        </p>
        <Button variant="outline" size="sm">
          Export Results
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead className="font-semibold">Risk Level</TableHead>
                <TableHead className="font-semibold">Survey Compliance</TableHead>
                <TableHead className="font-semibold">Weight Progress</TableHead>
                <TableHead className="font-semibold">Last Survey</TableHead>
                <TableHead className="font-semibold">Activity Level</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? `No members found matching "${searchQuery}"` : "No members found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onMemberClick?.(member)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.height} • {member.totalSurveys} surveys completed
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge
                        variant={getRiskBadgeVariant(member.riskLevel)}
                        className={cn(
                          "font-medium",
                          member.riskLevel === "High" && "bg-destructive/10 text-destructive border-destructive/20",
                          member.riskLevel === "Medium" && "bg-warning/10 text-warning border-warning/20",
                          member.riskLevel === "Low" && "bg-success/10 text-success border-success/20"
                        )}
                      >
                        {member.riskLevel}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getComplianceIcon(member.surveyCompliance)}
                        <span className="font-medium">{member.surveyCompliance}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Medication: {member.lastMedicationCompliance}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getWeightChangeIcon(member.weightChange)}
                        <span className={cn(
                          "font-medium",
                          member.weightChange > 0 ? "text-success" : "text-destructive"
                        )}>
                          {member.weightChange > 0 ? `-${member.weightChange}` : `+${Math.abs(member.weightChange)}`} lbs
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.initialWeight} → {member.currentWeight} lbs
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{member.lastSurveyDate}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Side effects: {member.lastSideEffects}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{member.averageActivity} days/week</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">{member.prescriptionDuration}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}