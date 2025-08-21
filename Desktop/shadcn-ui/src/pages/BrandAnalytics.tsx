import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart, LineChart, ShoppingBag, DollarSign, TrendingUp, Package, Users, Tag, Calendar, Search, Download, Star, CreditCard, PieChart } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for charts and metrics
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    name: month,
    sales: Math.floor(Math.random() * 200) + 50,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    customers: Math.floor(Math.random() * 100) + 30,
  }));
};

const mockAnalytics = {
  summary: {
    totalSales: 1875,
    totalRevenue: 56250,
    activeProducts: 42,
    avgOrderValue: 89.99,
    customerRetention: 68,
    newCustomers: 215,
    totalOrders: 1250,
    conversionRate: 3.2,
  },
  monthlyData: generateMonthlyData(),
  topProducts: [
    { id: 1, name: 'Premium Yoga Mat', sales: 320, price: 89.99, revenue: 28796.80, rating: 4.8 },
    { id: 2, name: 'Resistance Bands Set', sales: 285, price: 29.99, revenue: 8547.15, rating: 4.6 },
    { id: 3, name: 'Protein Powder (5lb)', sales: 198, price: 49.99, revenue: 9898.02, rating: 4.7 },
    { id: 4, name: 'Foam Roller', sales: 154, price: 24.99, revenue: 3848.46, rating: 4.5 },
    { id: 5, name: 'Fitness Tracker', sales: 132, price: 79.99, revenue: 10558.68, rating: 4.4 },
  ],
  topCustomers: [
    { id: 1, name: 'Alex Johnson', orders: 15, spent: 1250, lastOrder: '2023-11-15', status: 'Premium' },
    { id: 2, name: 'Sarah Williams', orders: 12, spent: 980, lastOrder: '2023-11-14', status: 'Premium' },
    { id: 3, name: 'Michael Brown', orders: 9, spent: 750, lastOrder: '2023-11-12', status: 'Regular' },
    { id: 4, name: 'Emily Davis', orders: 7, spent: 620, lastOrder: '2023-11-10', status: 'Regular' },
    { id: 5, name: 'David Wilson', orders: 5, spent: 430, lastOrder: '2023-11-08', status: 'New' },
  ],
  revenueByCategory: [
    { name: 'Fitness Equipment', value: 18500 },
    { name: 'Supplements', value: 12500 },
    { name: 'Apparel', value: 9800 },
    { name: 'Accessories', value: 4500 },
    { name: 'Digital Products', value: 2950 },
  ],
  salesTrend: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 30) + 5,
  })),
};

const StatCard = ({ title, value, icon: Icon, description, trend, trendType }: { title: string; value: string | number; icon: React.ElementType; description?: string; trend?: number; trendType?: 'up' | 'down' }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendType === 'up' ? '↑' : '↓'} {trend}% from last month
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProgressCard = ({ title, value, max, description }: { title: string; value: number; max: number; description?: string }) => (
  <Card className="h-full">
    <CardContent className="p-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground">{value}/{max}</span>
        </div>
        <Progress value={(value / max) * 100} className="h-2" />
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </CardContent>
  </Card>
);

const ChartPlaceholder = ({ title, icon: Icon, className = '' }: { title: string; icon: React.ElementType; className?: string }) => (
  <Card className={className}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[200px] flex items-center justify-center bg-muted/30 rounded-md">
        <div className="text-center text-muted-foreground text-sm">
          <BarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Chart data will be displayed here</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function BrandAnalytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your brand's performance and sales metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              className="pl-8 w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[600px] grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Revenue" 
              value={`$${mockAnalytics.summary.totalRevenue.toLocaleString()}`} 
              icon={DollarSign} 
              trend={8.2} 
              trendType="up" 
            />
            <StatCard 
              title="Total Sales" 
              value={mockAnalytics.summary.totalSales.toLocaleString()} 
              icon={ShoppingBag} 
              trend={12.5} 
              trendType="up" 
            />
            <StatCard 
              title="Avg. Order Value" 
              value={`$${mockAnalytics.summary.avgOrderValue.toFixed(2)}`} 
              icon={Tag} 
              trend={-1.8} 
              trendType="down" 
            />
            <StatCard 
              title="Conversion Rate" 
              value={`${mockAnalytics.summary.conversionRate}%`} 
              icon={TrendingUp} 
              trend={0.8} 
              trendType="up" 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ChartPlaceholder title="Sales Trend" icon={LineChart} />
            <ChartPlaceholder title="Revenue by Category" icon={PieChart} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topProducts.map((product) => (
                    <div key={product.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">{product.sales} sold</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {product.rating}
                        </div>
                        <span className="text-sm font-medium">${product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
                <CardDescription>Most valuable customers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.status} • {customer.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${customer.spent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Last: {format(new Date(customer.lastOrder), 'MMM d')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Active Products" 
              value={mockAnalytics.summary.activeProducts} 
              icon={Package} 
              description={`${Math.round((mockAnalytics.summary.activeProducts / 50) * 100)}% of inventory`} 
            />
            <StatCard 
              title="Top Selling" 
              value={mockAnalytics.topProducts[0].name} 
              icon={Star} 
              description={`${mockAnalytics.topProducts[0].sales} units sold`} 
            />
            <ProgressCard 
              title="Inventory Turnover" 
              value={68} 
              max={100} 
              description="Higher is better" 
            />
          </div>
          <ChartPlaceholder title="Product Performance" icon={BarChart} className="h-[400px]" />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="New Customers" 
              value={mockAnalytics.summary.newCustomers} 
              icon={Users} 
              trend={15.7} 
              trendType="up" 
            />
            <StatCard 
              title="Customer Retention" 
              value={`${mockAnalytics.summary.customerRetention}%`} 
              icon={TrendingUp} 
              trend={2.3} 
              trendType="up" 
            />
            <ProgressCard 
              title="Repeat Purchase Rate" 
              value={42} 
              max={100} 
              description="% of customers who made multiple purchases" 
            />
          </div>
          <ChartPlaceholder title="Customer Acquisition & Retention" icon={Users} className="h-[400px]" />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Total Revenue" 
              value={`$${mockAnalytics.summary.totalRevenue.toLocaleString()}`} 
              icon={DollarSign} 
              trend={8.2} 
              trendType="up" 
            />
            <StatCard 
              title="Avg. Order Value" 
              value={`$${mockAnalytics.summary.avgOrderValue.toFixed(2)}`} 
              icon={CreditCard} 
              trend={-1.8} 
              trendType="down" 
            />
            <ProgressCard 
              title="Revenue Goal" 
              value={mockAnalytics.summary.totalRevenue} 
              max={75000} 
              description={`${Math.round((mockAnalytics.summary.totalRevenue / 75000) * 100)}% of monthly target`} 
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ChartPlaceholder title="Revenue by Category" icon={PieChart} />
            <ChartPlaceholder title="Monthly Revenue Trend" icon={LineChart} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}