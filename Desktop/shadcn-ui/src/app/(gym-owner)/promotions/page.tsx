import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"

interface Promotion {
  id: string
  name: string
  status: 'active' | 'scheduled' | 'expired'
  startDate: string
  endDate: string
  uses: number
  maxUses?: number
}

const mockPromotions: Promotion[] = [
  { id: '1', name: 'Summer Special', status: 'active', startDate: '2023-06-01', endDate: '2023-08-31', uses: 42, maxUses: 100 },
  { id: '2', name: 'New Member Trial', status: 'active', startDate: '2023-07-01', endDate: '2023-12-31', uses: 28 },
  { id: '3', name: 'Refer a Friend', status: 'scheduled', startDate: '2023-07-15', endDate: '2023-09-15', uses: 0 },
  { id: '4', name: 'New Year Resolution', status: 'expired', startDate: '2023-01-01', endDate: '2023-01-31', uses: 65, maxUses: 100 }
]

const PromotionCard = ({ promo }: { promo: Promotion }) => (
  <Card className="p-4">
    <div className="flex justify-between">
      <h3 className="font-medium">{promo.name}</h3>
      <span className={`px-2 py-1 rounded-full text-xs ${
        promo.status === 'active' ? 'bg-green-100 text-green-800' :
        promo.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
      </span>
    </div>
    <div className="mt-2 text-sm text-muted-foreground">
      {promo.startDate} - {promo.endDate}
    </div>
    <div className="mt-2 text-sm">
      {promo.uses}{promo.maxUses ? `/${promo.maxUses}` : ''} uses
    </div>
  </Card>
)

export default function PromotionsPage() {
  const activePromos = mockPromotions.filter(p => p.status === 'active')
  const scheduledPromos = mockPromotions.filter(p => p.status === 'scheduled')
  const expiredPromos = mockPromotions.filter(p => p.status === 'expired')
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Manage your marketing campaigns</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {activePromos.map(promo => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {scheduledPromos.map(promo => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </TabsContent>

        <TabsContent value="expired" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {expiredPromos.map(promo => (
            <PromotionCard key={promo.id} promo={promo} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
