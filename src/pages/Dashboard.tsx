import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberCard, Member } from "@/components/MemberCard";
import { mockMembers } from "@/data/members";
import { Users, Activity, AlertTriangle, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<"risk" | "compliance" | "weightLoss">("risk");
  const [filterRisk, setFilterRisk] = useState<"All" | "High" | "Medium" | "Low">("All");

  const sortedMembers = [...mockMembers]
    .filter(member => filterRisk === "All" || member.riskLevel === filterRisk)
    .sort((a, b) => {
      if (sortBy === "risk") {
        const riskOrder = { "High": 3, "Medium": 2, "Low": 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      } else if (sortBy === "compliance") {
        return a.surveyCompliance - b.surveyCompliance;
      } else {
        return a.weightLoss - b.weightLoss;
      }
    });

  const stats = {
    totalMembers: mockMembers.length,
    highRisk: mockMembers.filter(m => m.riskLevel === "High").length,
    avgCompliance: Math.round(mockMembers.reduce((acc, m) => acc + m.surveyCompliance, 0) / mockMembers.length),
    avgWeightLoss: Math.round(mockMembers.reduce((acc, m) => acc + m.weightLoss, 0) / mockMembers.length * 10) / 10,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Care Complete</h1>
              <p className="text-muted-foreground mt-1">GLP-1 Weight Management Program</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Dashboard
              </Badge>
              <Button>Export Data</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalMembers}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High Risk Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.highRisk}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Avg. Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.avgCompliance}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Avg. Weight Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.avgWeightLoss} lbs</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Sort by Risk Level</SelectItem>
                <SelectItem value="compliance">Sort by Compliance</SelectItem>
                <SelectItem value="weightLoss">Sort by Weight Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={(value: any) => setFilterRisk(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Risk Levels</SelectItem>
                <SelectItem value="High">High Risk Only</SelectItem>
                <SelectItem value="Medium">Medium Risk Only</SelectItem>
                <SelectItem value="Low">Low Risk Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 text-sm text-muted-foreground self-end">
            Showing {sortedMembers.length} of {stats.totalMembers} members
          </div>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>

        {/* Empty State */}
        {sortedMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No members found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}