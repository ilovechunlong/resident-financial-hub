
import { Building2, Users, DollarSign, FileText, PlusCircle, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { QuickActionCard } from "@/components/QuickActionCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  // Mock data - in real app this would come from your backend
  const stats = {
    nursingHomes: 3,
    totalResidents: 84,
    activeResidents: 78,
    monthlyRevenue: 245600,
    outstandingPayments: 12400
  }

  const recentActivity = [
    {
      type: "resident_added",
      message: "New resident John Smith onboarded to Sunset Manor",
      time: "2 hours ago"
    },
    {
      type: "payment_received",
      message: "$4,200 SSI payment received for resident Mary Johnson",
      time: "4 hours ago"
    },
    {
      type: "expense_logged",
      message: "Monthly rent expense logged for Greenwood Care - $8,500",
      time: "1 day ago"
    },
    {
      type: "report_generated",
      message: "Annual financial report generated for Sunset Manor",
      time: "2 days ago"
    }
  ]

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
          value={stats.nursingHomes}
          icon={Building2}
          description="Active facilities"
        />
        <StatCard
          title="Total Residents"
          value={stats.totalResidents}
          icon={Users}
          description={`${stats.activeResidents} active, ${stats.totalResidents - stats.activeResidents} discharged`}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Combined facility income"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Outstanding Payments"
          value={`$${stats.outstandingPayments.toLocaleString()}`}
          icon={TrendingUp}
          description="Pending collections"
          trend={{ value: 5, isPositive: false }}
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
            href="/nursing-homes/new"
          />
          <QuickActionCard
            title="Onboard Resident"
            description="Add a new resident to any of your facilities"
            icon={PlusCircle}
            buttonText="Onboard Resident"
            href="/residents/new"
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
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
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
                ))}
              </div>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                  <div>
                    <p className="font-medium">Sunset Manor</p>
                    <p className="text-sm text-muted-foreground">32 residents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">98% occupancy</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                  <div>
                    <p className="font-medium">Greenwood Care</p>
                    <p className="text-sm text-muted-foreground">28 residents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">93% occupancy</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                  <div>
                    <p className="font-medium">Harmony Heights</p>
                    <p className="text-sm text-muted-foreground">18 residents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">75% occupancy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
