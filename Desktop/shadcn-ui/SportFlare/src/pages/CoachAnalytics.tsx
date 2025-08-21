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
  Users, 
  DollarSign, 
  BarChart2, 
  TrendingUp, 
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Award
} from 'lucide-react';

export default function CoachAnalytics() {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState('30days');

  // Redirect if not coach
  if (user?.role !== 'coach') {
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
        <h1 className="text-3xl font-bold tracking-tight">Coach Analytics</h1>
        <p className="text-muted-foreground">Track your performance and student progress</p>
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
              Classes Taught
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                8%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Attendance
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">548</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                12%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5.0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                0.2
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6,240</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                15%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Ratings</CardTitle>
              <CardDescription>
                Average ratings for your classes over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing rating trends over time</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>Rating by class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">HIIT Revolution</div>
                    <span className="text-sm text-muted-foreground">4.9/5.0</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Strength Fundamentals</div>
                    <span className="text-sm text-muted-foreground">4.7/5.0</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Yoga Flow</div>
                    <span className="text-sm text-muted-foreground">4.8/5.0</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Circuit Training</div>
                    <span className="text-sm text-muted-foreground">4.6/5.0</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Class Attendance</CardTitle>
                <CardDescription>Percentage of capacity filled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">HIIT Revolution</div>
                    <span className="text-sm text-muted-foreground">92% full</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Strength Fundamentals</div>
                    <span className="text-sm text-muted-foreground">85% full</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Yoga Flow</div>
                    <span className="text-sm text-muted-foreground">78% full</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Circuit Training</div>
                    <span className="text-sm text-muted-foreground">95% full</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>
                Student attendance and retention metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing student engagement over time</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Returning Students</CardTitle>
                <CardDescription>Students attending multiple classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium mb-1">Retention Rate</div>
                  <div className="flex items-center gap-2">
                    <Progress value={76} className="h-3" />
                    <span className="text-sm font-medium">76%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    76% of students return for at least one more class
                  </p>
                </div>
                
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Top Returning Students</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-medium">John Doe</p>
                          <p className="text-xs text-muted-foreground">24 classes</p>
                        </div>
                      </div>
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          AS
                        </div>
                        <div>
                          <p className="text-sm font-medium">Alice Smith</p>
                          <p className="text-xs text-muted-foreground">18 classes</p>
                        </div>
                      </div>
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          RJ
                        </div>
                        <div>
                          <p className="text-sm font-medium">Robert Johnson</p>
                          <p className="text-xs text-muted-foreground">15 classes</p>
                        </div>
                      </div>
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
                <CardDescription>Breakdown by experience level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Beginner</div>
                    <span className="text-sm text-muted-foreground">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Intermediate</div>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Advanced</div>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                
                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Student Goals</div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Weight Loss</div>
                        <span className="text-sm text-muted-foreground">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Muscle Gain</div>
                        <span className="text-sm text-muted-foreground">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">General Fitness</div>
                        <span className="text-sm text-muted-foreground">30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Monthly earnings breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization would be here</p>
                <p className="text-sm">Showing earnings data over time</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings by Class Type</CardTitle>
                <CardDescription>Revenue distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">HIIT Classes</div>
                    <span className="text-sm text-muted-foreground">$2,140</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Strength Training</div>
                    <span className="text-sm text-muted-foreground">$1,870</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Yoga Sessions</div>
                    <span className="text-sm text-muted-foreground">$1,240</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Personal Training</div>
                    <span className="text-sm text-muted-foreground">$990</span>
                  </div>
                  <Progress value={16} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Gym Central</p>
                      <p className="text-xs text-muted-foreground">July 15, 2023</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+$1,240</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">SportFlare Fitness</p>
                      <p className="text-xs text-muted-foreground">July 1, 2023</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+$920</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Elite Training Center</p>
                      <p className="text-xs text-muted-foreground">June 28, 2023</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+$785</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">PowerFit Gym</p>
                      <p className="text-xs text-muted-foreground">June 15, 2023</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+$1,050</p>
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