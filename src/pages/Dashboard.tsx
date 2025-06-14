
import { Building2, Users, DollarSign, FileText, PlusCircle, TrendingUp, LoaderIcon } from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { QuickActionCard } from "@/components/QuickActionCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { useRecentActivity } from "@/hooks/useRecentActivity"
import { useFacilityOverview } from "@/hooks/useFacilityOverview"

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilityOverview();

  if (statsLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <LoaderIcon className="h-8 w-8 animate-spin text-healthcare-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Administrator</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your care facilities today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Nursing Homes"
          value={stats?.nursingHomes || 0}
          icon={Building2}
          description="Active facilities"
        />
        <StatCard
          title="Total Residents"
          value={stats?.totalResidents || 0}
          icon={Users}
          description={`${stats?.activeResidents || 0} active, ${(stats?.totalResidents || 0) - (stats?.activeResidents || 0)} discharged`}
          trend={stats?.totalResidents ? { value: 8, isPositive: true } : undefined}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Combined facility income"
          trend={stats?.monthlyRevenue ? { value: 12, isPositive: true } : undefined}
        />
        <StatCard
          title="Outstanding Payments"
          value={`$${(stats?.outstandingPayments || 0).toLocaleString()}`}
          icon={TrendingUp}
          description="Pending collections"
          trend={stats?.outstandingPayments ? { value: 5, isPositive: false } : undefined}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Add Nursing Home"
            description="Register a new care facility in the system"
            icon={Building2}
            buttonText="Add Facility"
            href="/nursing-homes"
          />
          <QuickActionCard
            title="Onboard Resident"
            description="Add a new resident to any of your facilities"
            icon={PlusCircle}
            buttonText="Onboard Resident"
            href="/residents"
          />
          <QuickActionCard
            title="Generate Report"
            description="Create financial or operational reports"
            icon={FileText}
            buttonText="Create Report"
            href="/reports"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-healthcare-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="h-6 w-6 animate-spin text-healthcare-primary" />
                  <span className="ml-2 text-muted-foreground">Loading activity...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-1 rounded-full ${
                          activity.type === 'resident_added' ? 'bg-green-100 text-green-600' :
                          activity.type === 'payment_received' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'expense_logged' ? 'bg-orange-100 text-orange-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Facility Overview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-healthcare-primary" />
                Facility Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {facilitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="h-6 w-6 animate-spin text-healthcare-primary" />
                  <span className="ml-2 text-muted-foreground">Loading facilities...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {facilities && facilities.length > 0 ? (
                    facilities.map((facility) => (
                      <div key={facility.id} className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                        <div>
                          <p className="font-medium">{facility.name}</p>
                          <p className="text-sm text-muted-foreground">{facility.currentResidents} residents</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            facility.occupancyRate >= 90 ? 'text-green-600' :
                            facility.occupancyRate >= 75 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {facility.occupancyRate}% occupancy
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No facilities found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
