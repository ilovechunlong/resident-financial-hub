
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  buttonText: string
  href: string
  className?: string
}

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  buttonText, 
  href,
  className 
}: QuickActionCardProps) {
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50 bg-card ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-healthcare-primary/10 via-transparent to-healthcare-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-healthcare-primary/10 group-hover:bg-healthcare-primary/20 transition-colors duration-300">
            <Icon className="h-6 w-6 text-healthcare-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-card-foreground">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <Button asChild className="w-full bg-healthcare-primary hover:bg-healthcare-primary/90 text-white">
          <Link to={href}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
