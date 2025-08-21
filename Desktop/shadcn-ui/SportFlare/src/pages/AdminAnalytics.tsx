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
  Users, 
  DollarSign, 
  BarChart2, 
  TrendingUp,
  Building,
  ShoppingBag, 
  Flag,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function AdminAnalytics() {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState('30days');

  // Redirect if not admin
  if (user?.role !== 'admin') {
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
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive overview of the SportFlare platform</p>
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
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,485</div>
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
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$248,670</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                24%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Partner Businesses
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">482</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                12
              </span>{" "}
              new this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Support Tickets
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                8
              </span>{" "}
              open tickets
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing user growth over time</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Regular Members</div>
                    <span className="text-sm text-muted-foreground">9,645 (77.2%)</span>
                  </div>
                  <Progress value={77.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Coaches</div>
                    <span className="text-sm text-muted-foreground">1,486 (11.9%)</span>
                  </div>
                  <Progress value={11.9} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Gym Owners</div>
                    <span className="text-sm text-muted-foreground">824 (6.6%)</span>
                  </div>
                  <Progress value={6.6} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Brands</div>
                    <span className="text-sm text-muted-foreground">530 (4.3%)</span>
                  </div>
                  <Progress value={4.3} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Daily Active Users</div>
                    <span className="text-sm text-muted-foreground">4,126</span>
                  </div>
                  <Progress value={(4126/12485)*100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Weekly Active Users</div>
                    <span className="text-sm text-muted-foreground">7,842</span>
                  </div>
                  <Progress value={(7842/12485)*100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Monthly Active Users</div>
                    <span className="text-sm text-muted-foreground">10,240</span>
                  </div>
                  <Progress value={(10240/12485)*100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Average Session Duration</div>
                    <span className="text-sm text-muted-foreground">18.4 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Platform revenue by month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart2 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing monthly revenue data</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Subscription Fees</div>
                    <span className="text-sm text-muted-foreground">$105,240 (42.3%)</span>
                  </div>
                  <Progress value={42.3} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Class Bookings</div>
                    <span className="text-sm text-muted-foreground">$84,620 (34.0%)</span>
                  </div>
                  <Progress value={34.0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Marketplace Sales</div>
                    <span className="text-sm text-muted-foreground">$48,560 (19.5%)</span>
                  </div>
                  <Progress value={19.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Other</div>
                    <span className="text-sm text-muted-foreground">$10,250 (4.2%)</span>
                  </div>
                  <Progress value={4.2} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Average Revenue Per User</p>
                      <p className="text-xs text-muted-foreground">Monthly</p>
                    </div>
                    <p className="text-sm font-medium">$19.92</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Customer Acquisition Cost</p>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                    <p className="text-sm font-medium">$14.25</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Lifetime Value</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                    <p className="text-sm font-medium">$246.80</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Churn Rate</p>
                      <p className="text-xs text-muted-foreground">Monthly</p>
                    </div>
                    <p className="text-sm font-medium">3.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Partners Growth</CardTitle>
              <CardDescription>
                Onboarding of new gyms, coaches, and brands
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing business partner growth</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Gyms</CardTitle>
                <CardDescription>By revenue generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">FitZone Central</p>
                      <p className="text-xs text-muted-foreground">4.9 avg. rating</p>
                    </div>
                    <p className="text-sm font-medium">$12,840</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">PowerLift Studio</p>
                      <p className="text-xs text-muted-foreground">4.8 avg. rating</p>
                    </div>
                    <p className="text-sm font-medium">$10,265</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Elite Training Center</p>
                      <p className="text-xs text-muted-foreground">4.7 avg. rating</p>
                    </div>
                    <p className="text-sm font-medium">$9,120</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Flex Fitness</p>
                      <p className="text-xs text-muted-foreground">4.8 avg. rating</p>
                    </div>
                    <p className="text-sm font-medium">$8,745</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Brands</CardTitle>
                <CardDescription>By marketplace sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">PeakPerformance</p>
                      <p className="text-xs text-muted-foreground">Supplements</p>
                    </div>
                    <p className="text-sm font-medium">$14,280</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">FitWear</p>
                      <p className="text-xs text-muted-foreground">Apparel</p>
                    </div>
                    <p className="text-sm font-medium">$11,450</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">StrongGear</p>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                    </div>
                    <p className="text-sm font-medium">$8,920</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">VitalNutrition</p>
                      <p className="text-xs text-muted-foreground">Supplements</p>
                    </div>
                    <p className="text-sm font-medium">$7,840</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                Platform uptime and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing system performance data</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Reports</CardTitle>
                <CardDescription>Open support tickets by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Account Access</div>
                    <span className="text-sm text-muted-foreground">16 tickets</span>
                  </div>
                  <Progress value={33.3} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Payment Issues</div>
                    <span className="text-sm text-muted-foreground">12 tickets</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Feature Requests</div>
                    <span className="text-sm text-muted-foreground">14 tickets</span>
                  </div>
                  <Progress value={29.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Other</div>
                    <span className="text-sm text-muted-foreground">6 tickets</span>
                  </div>
                  <Progress value={12.5} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Performance metrics for last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">System Uptime</div>
                    <span className="text-sm text-green-500 font-medium">99.98%</span>
                  </div>
                  <Progress value={99.98} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Average Response Time</div>
                    <span className="text-sm text-green-500 font-medium">142ms</span>
                  </div>
                  <Progress value={80} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Error Rate</div>
                    <span className="text-sm text-green-500 font-medium">0.12%</span>
                  </div>
                  <Progress value={5} className="h-2 bg-green-100" />
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Next Scheduled Maintenance</p>
                    </div>
                    <p className="text-sm font-medium">Aug 15, 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}