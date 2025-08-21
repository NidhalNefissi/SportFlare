import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  BarChart2, 
  TrendingUp, 
  Package,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Globe,
  Users
} from 'lucide-react';

export default function BrandAnalytics() {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState('30days');

  // Redirect if not brand
  if (user?.role !== 'brand') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand Analytics</h1>
        <p className="text-muted-foreground">Track sales performance and optimize inventory</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeFrame === 'custom' && (
            <DatePickerWithRange 
              date={dateRange} 
              setDate={setDateRange} 
            />
          )}
        </div>
        <div>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">258</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                14%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                18%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$59.75</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                3%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Return Rate
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                0.8%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Daily sales trends over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart2 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing daily sales data</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution by product category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Supplements</div>
                    <span className="text-sm text-muted-foreground">$6,420</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Apparel</div>
                    <span className="text-sm text-muted-foreground">$4,850</span>
                  </div>
                  <Progress value={31} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Equipment</div>
                    <span className="text-sm text-muted-foreground">$2,940</span>
                  </div>
                  <Progress value={19} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Accessories</div>
                    <span className="text-sm text-muted-foreground">$1,210</span>
                  </div>
                  <Progress value={8} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Location</CardTitle>
                <CardDescription>Top selling regions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">West Coast</span>
                    </div>
                    <span className="text-sm text-muted-foreground">38%</span>
                  </div>
                  <Progress value={38} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">East Coast</span>
                    </div>
                    <span className="text-sm text-muted-foreground">29%</span>
                  </div>
                  <Progress value={29} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Midwest</span>
                    </div>
                    <span className="text-sm text-muted-foreground">21%</span>
                  </div>
                  <Progress value={21} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">South</span>
                    </div>
                    <span className="text-sm text-muted-foreground">12%</span>
                  </div>
                  <Progress value={12} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Sales metrics for individual products
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing product performance data</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Premium Protein Powder</p>
                      <p className="text-xs text-muted-foreground">84 units sold</p>
                    </div>
                    <p className="text-sm font-medium">$2,520</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Performance Leggings</p>
                      <p className="text-xs text-muted-foreground">62 units sold</p>
                    </div>
                    <p className="text-sm font-medium">$1,860</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pre-Workout Energy Mix</p>
                      <p className="text-xs text-muted-foreground">58 units sold</p>
                    </div>
                    <p className="text-sm font-medium">$1,740</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Fitness Tracking Watch</p>
                      <p className="text-xs text-muted-foreground">42 units sold</p>
                    </div>
                    <p className="text-sm font-medium">$3,360</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current stock levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Premium Protein Powder</div>
                    <span className="text-sm text-green-500 font-medium">
                      In Stock (124 units)
                    </span>
                  </div>
                  <Progress value={62} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Performance Leggings</div>
                    <span className="text-sm text-amber-500 font-medium">
                      Low Stock (18 units)
                    </span>
                  </div>
                  <Progress value={18} className="h-2 bg-amber-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Pre-Workout Energy Mix</div>
                    <span className="text-sm text-green-500 font-medium">
                      In Stock (92 units)
                    </span>
                  </div>
                  <Progress value={46} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Fitness Tracking Watch</div>
                    <span className="text-sm text-red-500 font-medium">
                      Out of Stock
                    </span>
                  </div>
                  <Progress value={0} className="h-2 bg-red-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Demographics</CardTitle>
              <CardDescription>
                Customer profile and purchase behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing customer demographics data</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
                <CardDescription>Repeat purchase rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium mb-1">Retention Rate</div>
                  <div className="flex items-center gap-2">
                    <Progress value={64} className="h-3" />
                    <span className="text-sm font-medium">64%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    64% of customers make at least one repeat purchase
                  </p>
                </div>
                
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Repeat Purchase Timeline</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Within 30 days</div>
                      <div className="text-sm font-medium">28%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">31-60 days</div>
                      <div className="text-sm font-medium">22%</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">61-90 days</div>
                      <div className="text-sm font-medium">14%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>How customers find your products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">In-gym Promotions</div>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Online Marketplace</div>
                    <span className="text-sm text-muted-foreground">32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Social Media</div>
                    <span className="text-sm text-muted-foreground">18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Referrals</div>
                    <span className="text-sm text-muted-foreground">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}