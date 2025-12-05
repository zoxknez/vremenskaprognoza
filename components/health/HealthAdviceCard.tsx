'use client';

import { AQICategory, AQI_COLORS } from '@/lib/types/air-quality';
import {
  HEALTH_ADVICE,
  SENSITIVE_GROUPS,
  ACTIVITY_RECOMMENDATIONS,
  getActivityRecommendation,
} from '@/lib/health/advice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import {
  Heart,
  Wind,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  Users,
  Activity,
} from 'lucide-react';

interface HealthAdviceCardProps {
  aqiCategory: AQICategory;
  aqi: number;
}

export function HealthAdviceCard({ aqiCategory, aqi }: HealthAdviceCardProps) {
  const advice = HEALTH_ADVICE[aqiCategory];
  const colors = AQI_COLORS[aqiCategory];

  return (
    <Card className={cn(colors.bg, colors.border)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">{advice.icon}</span>
          <div>
            <div className={cn('text-lg', colors.text)}>{advice.title}</div>
            <div className="text-sm font-normal text-muted-foreground">
              AQI: {aqi}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{advice.description}</p>

        {/* General Population */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            Opšta populacija
          </h4>
          <ul className="space-y-2">
            {advice.generalPopulation.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Sensitive Groups */}
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-red-500" />
            Osetljive grupe
          </h4>
          <ul className="space-y-2">
            {advice.sensitiveGroups.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Outdoor Activity Recommendation */}
        <div className="pt-4 border-t">
          <OutdoorActivityBadge level={advice.outdoorActivity} />
        </div>
      </CardContent>
    </Card>
  );
}

function OutdoorActivityBadge({
  level,
}: {
  level: 'recommended' | 'moderate' | 'reduce' | 'avoid' | 'stay-indoors';
}) {
  const config = {
    recommended: {
      text: 'Aktivnosti napolju preporučene',
      icon: CheckCircle,
      variant: 'default' as const,
      className: 'bg-green-500',
    },
    moderate: {
      text: 'Umjerene aktivnosti napolju',
      icon: MinusCircle,
      variant: 'secondary' as const,
      className: 'bg-yellow-500',
    },
    reduce: {
      text: 'Smanjite aktivnosti napolju',
      icon: AlertTriangle,
      variant: 'secondary' as const,
      className: 'bg-orange-500',
    },
    avoid: {
      text: 'Izbegavajte aktivnosti napolju',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-red-500',
    },
    'stay-indoors': {
      text: 'Ostanite u zatvorenom prostoru',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-purple-500',
    },
  };

  const { text, icon: Icon, className } = config[level];

  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-lg text-white', className)}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{text}</span>
    </div>
  );
}

// Sensitive groups info card
export function SensitiveGroupsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Osetljive grupe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SENSITIVE_GROUPS.map((group) => (
            <div
              key={group.id}
              className="p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="text-2xl mb-2">{group.icon}</div>
              <div className="font-medium text-sm">{group.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {group.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Activity recommendations
interface ActivityRecommendationsProps {
  aqi: number;
}

export function ActivityRecommendations({ aqi }: ActivityRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Preporuke za aktivnosti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(ACTIVITY_RECOMMENDATIONS).map(([key, activity]) => {
            const recommendation = getActivityRecommendation(
              key as keyof typeof ACTIVITY_RECOMMENDATIONS,
              aqi
            );
            
            const statusColors = {
              safe: 'text-green-500 bg-green-500/10',
              caution: 'text-yellow-500 bg-yellow-500/10',
              reduce: 'text-orange-500 bg-orange-500/10',
              avoid: 'text-red-500 bg-red-500/10',
            };

            const statusIcons = {
              safe: CheckCircle,
              caution: MinusCircle,
              reduce: AlertTriangle,
              avoid: XCircle,
            };

            const StatusIcon = statusIcons[recommendation.status as keyof typeof statusIcons];

            return (
              <div
                key={key}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  statusColors[recommendation.status as keyof typeof statusColors]
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <span className="font-medium">{activity.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm">{recommendation.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact health tip for dashboard
export function HealthTipBadge({ aqiCategory }: { aqiCategory: AQICategory }) {
  const advice = HEALTH_ADVICE[aqiCategory];
  const colors = AQI_COLORS[aqiCategory];

  const tips = {
    good: 'Idealno za aktivnosti napolju',
    moderate: 'Većina može normalno nastaviti aktivnosti',
    unhealthy: 'Osetljive grupe treba da smanje napore',
    'very-unhealthy': 'Izbegavajte aktivnosti napolju',
    hazardous: 'Ostanite u zatvorenom!',
  };

  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg text-sm', colors.bg, colors.text)}>
      <span>{advice.icon}</span>
      <span>{tips[aqiCategory]}</span>
    </div>
  );
}
