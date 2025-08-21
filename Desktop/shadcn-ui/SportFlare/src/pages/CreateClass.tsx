import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Icons
import { Calendar as CalendarIcon, Clock, MapPin, Tag, Dumbbell, Info, DollarSign, Users } from 'lucide-react';

// Mock gyms data
const mockGyms = [
  { id: '1', name: 'FitZone Gym', address: '123 Fitness St, New York' },
  { id: '2', name: 'ZenFit Studio', address: '456 Zen Ave, Los Angeles' },
  { id: '3', name: 'PowerLift Center', address: '789 Strength Blvd, Chicago' },
];

// Class types
const classTypes = [
  'Yoga', 'HIIT', 'Strength Training', 'Cardio', 'Pilates', 'CrossFit',
  'Dance', 'Cycling', 'Boxing', 'Meditation', 'Swimming', 'Running',
];

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500),
  type: z.string({ required_error: 'Please select a class type' }),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in 24-hour format (HH:MM)' }),
  duration: z.coerce.number().min(5, { message: 'Duration must be at least 5 minutes' }).max(300),
  capacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1' }).max(500),
  price: z.coerce.number().min(0, { message: 'Price must be at least 0' }).max(1000),
  isOnline: z.boolean().default(false),
  gymId: z.string().optional().nullable(),
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  isRecurring: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof formSchema>;

export default function CreateClass() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [formType, setFormType] = useState<'oneoff' | 'program'>('oneoff');

  // Initialize form
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      duration: 60,
      capacity: 10,
      price: 15,
      isOnline: false,
      difficultyLevel: 'Intermediate',
      isRecurring: false,
    }
  });

  // Redirect if not a coach or gym
  if (user && user.role !== 'coach' && user.role !== 'gym') {
    navigate('/');
    return null;
  }

  const onSubmit = (data: ClassFormValues) => {
    // Show success toast
    toast({
      title: "Class created successfully!",
      description: "Your class has been created and is now pending approval.",
    });
    
    // Navigate back to classes page
    setTimeout(() => {
      navigate('/classes');
    }, 2000);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const nextStep = () => {
    form.trigger().then(isValid => {
      if (isValid) setStep(prev => prev + 1);
    });
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create a New Class</h1>

      <Tabs defaultValue="oneoff" onValueChange={(value) => setFormType(value as 'oneoff' | 'program')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="oneoff">One-off Class</TabsTrigger>
          <TabsTrigger value="program">Program Series</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {formType === 'oneoff' ? 'Create a Single Class' : 'Create a Program Series'}
            </CardTitle>
            <CardDescription>
              {formType === 'oneoff' 
                ? 'Set up a one-time class for your students' 
                : 'Create a program with multiple classes'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-2 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Morning Yoga Flow" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your class" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Class Type */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select class type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Difficulty Level */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="difficultyLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Time */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <Input type="time" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" min={5} max={300} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 - Additional Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Online Class Toggle */}
                      <div className="space-y-2 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="isOnline"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={isOnline}
                                  onCheckedChange={(checked) => {
                                    setIsOnline(!!checked);
                                    field.onChange(!!checked);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Online Class</FormLabel>
                                <FormDescription>
                                  This class will be conducted online via video conferencing
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Gym Location - if not online and user is coach */}
                      {!isOnline && user?.role === 'coach' && (
                        <div className="space-y-2 md:col-span-2">
                          <FormField
                            control={form.control}
                            name="gymId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gym Location</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a gym" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {mockGyms.map(gym => (
                                      <SelectItem key={gym.id} value={gym.id}>
                                        {gym.name} - {gym.address}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Select the gym where this class will take place
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Capacity */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <Input type="number" min={1} max={500} {...field} />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Maximum number of participants
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <Input type="number" min={0} step={0.01} {...field} />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Set to 0 for free classes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-2 md:col-span-2">
                        <FormLabel>Tags</FormLabel>
                        <FormDescription className="mb-2">
                          Select tags that describe your class
                        </FormDescription>
                        <div className="flex flex-wrap gap-2">
                          {['Beginner Friendly', 'High Intensity', 'Low Impact', 'Strength', 'Cardio', 'Flexibility', 
                            'Morning', 'Evening', 'Weekend'].map(tag => (
                            <Button
                              type="button"
                              key={tag}
                              variant={selectedTags.includes(tag) ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleTagToggle(tag)}
                              className="flex items-center gap-1"
                            >
                              {selectedTags.includes(tag) && '✓ '}
                              {tag}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3 - Review & Submit */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Review Your Class</h3>
                    
                    <div className="border rounded-md p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{form.getValues('title') || 'Class Title'}</h4>
                        <p className="text-muted-foreground">{form.getValues('description') || 'No description provided'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {form.getValues('date') ? format(form.getValues('date'), "PPP") : 'No date selected'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {form.getValues('time') || '--:--'} · {form.getValues('duration') || 0} mins
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{form.getValues('type') || 'No type selected'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{form.getValues('difficultyLevel') || 'No difficulty selected'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Capacity: {form.getValues('capacity') || 0}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {form.getValues('price') ? `$${form.getValues('price')}` : 'Free'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {isOnline ? 'Online Class' : 
                              form.getValues('gymId') ? 
                                mockGyms.find(g => g.id === form.getValues('gymId'))?.name || 'Selected Gym' : 
                                'No location selected'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {selectedTags.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Tags:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedTags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="border-t pt-4 flex justify-between">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit">
                      {user?.role === 'gym' ? 'Create Class' : 'Submit for Approval'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}