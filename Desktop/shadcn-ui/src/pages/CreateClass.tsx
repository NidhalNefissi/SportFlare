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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Icons
import { Clock, MapPin, Tag, Dumbbell, Info, DollarSign, Users, Edit, XCircle } from 'lucide-react';

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
  // Only require date, time, duration for one-off class
  date: z.date().optional(),
  time: z.string().optional(),
  duration: z.coerce.number().optional(),
  capacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1' }).max(500),
  price: z.coerce.number().min(0, { message: 'Price must be at least 0' }).max(1000),
  isOnline: z.boolean().default(false),
  gymId: z.string().optional().nullable(),
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  isRecurring: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof formSchema>;

import { mockClasses } from '../data/mockData';

export default function CreateClass() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [formType, setFormType] = useState<'oneoff' | 'program'>('oneoff');
  const [photos, setPhotos] = useState<File[]>([]);
  // For Program Series sessions
  const [sessions, setSessions] = useState([{ date: undefined as Date | undefined, time: '', duration: 60 }]);
  const [sessionErrors, setSessionErrors] = useState<string>('');

  // Helper: get coach's classes
  const myClasses = user?.role === 'coach' ? mockClasses.filter(c => c.coachId === user.id) : [];
  const now = new Date();
  const canModifyOrCancel = (classDate: Date) => {
    // Platform logic: cannot modify/cancel within 24 hours of class start
    return (classDate.getTime() - now.getTime()) > 24 * 60 * 60 * 1000;
  };

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
      title: "Class created!",
      description: "Your class is now pending gym confirmation or counter-proposal.",
    });
    // Here, you would send the class with status: 'pending' to the backend
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

  // Validate sessions before moving to next step
  const validateSessions = () => {
    if (formType !== 'program') return true;
    if (sessions.length < 2) {
      setSessionErrors('Please add at least two sessions.');
      return false;
    }
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      if (!s.date || !s.time || !s.duration) {
        setSessionErrors('Please fill date, time, and duration for all sessions.');
        return false;
      }
    }
    setSessionErrors('');
    return true;
  };

  const nextStep = () => {
    if (formType === 'program' && step === 1) {
      if (!validateSessions()) return;
    }
    form.trigger().then(isValid => {
      if (isValid) setStep(prev => prev + 1);
    });
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  // Handle session add/remove for Program Series
  const handleAddSession = () => {
    setSessions([...sessions, { date: undefined, time: '', duration: 60 }]);
  };
  const handleSessionChange = (idx: number, field: 'date' | 'time' | 'duration', value: any) => {
    setSessions(sessions.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const handleRemoveSession = (idx: number) => {
    setSessions(sessions.filter((_, i) => i !== idx));
  };

  // Handle Modify
  const handleOpenEdit = (classItem) => {
    setEditClass(classItem);
    setEditForm({
      title: classItem.title,
      description: classItem.description,
      date: classItem.date instanceof Date ? classItem.date.toISOString().slice(0, 10) : (typeof classItem.date === 'string' ? classItem.date : ''),
      time: classItem.time || '',
      duration: classItem.duration || 60,
    });
    setIsEditOpen(true);
  };
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };
  const handleEditSave = () => {
    setMyClassesState(prev => prev.map(c =>
      c.id === editClass.id
        ? {
          ...c,
          ...editForm,
          date: typeof editForm.date === 'string' ? new Date(editForm.date) : editForm.date,
          status: 'pending'
        }
        : c
    ));
    setIsEditOpen(false);
    setEditClass(null);
    toast({
      title: "Class modification submitted!",
      description: "Your changes are pending gym confirmation or counter-proposal.",
    });
  };

  // Handle Cancel
  const handleOpenCancel = (classItem) => {
    setCancelClass(classItem);
    setIsCancelOpen(true);
  };
  const handleCancelConfirm = () => {
    setMyClassesState(prev => prev.filter(c => c.id !== cancelClass.id));
    setIsCancelOpen(false);
    setCancelClass(null);
  };

  const [myClassesState, setMyClassesState] = useState(myClasses);
  const [editClass, setEditClass] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [cancelClass, setCancelClass] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', time: '', duration: 60 });

  return (
    <div className="space-y-6 relative z-0 overflow-visible">
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

                      {/* Only show Date, Time, Duration for One-off Class */}
                      {formType === 'oneoff' && (
                        <>
                          {/* Date */}
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={field.value ? 'outline' : 'secondary'}
                                        className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                                      >
                                        {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
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
                        </>
                      )}

                      {/* Photos Upload */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="block font-medium">Class Photos</label>
                        <Input type="file" multiple accept="image/*" onChange={handlePhotoChange} />
                        {photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {photos.map((file, idx) => (
                              <div key={idx} className="w-20 h-20 border rounded overflow-hidden flex items-center justify-center bg-muted">
                                <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Program Series Sessions */}
                      {formType === 'program' && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block font-medium mb-1">Sessions <span className='text-destructive'>*</span></label>
                          {sessions.map((session, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-2 items-center mb-2 w-full">
                              {/* Date Input with Calendar */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={session.date ? 'outline' : 'secondary'}
                                    className={cn('md:w-40 justify-start text-left font-normal', !session.date && 'text-muted-foreground')}
                                  >
                                    {session.date ? format(session.date, 'PPP') : 'Pick a date'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={session.date}
                                    onSelect={date => handleSessionChange(idx, 'date', date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {/* Time Input */}
                              <div className="flex items-center w-full md:w-32">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="time"
                                  value={session.time}
                                  onChange={e => handleSessionChange(idx, 'time', e.target.value)}
                                  placeholder="--:--"
                                  className={(!session.time && sessionErrors) ? 'border-destructive md:w-32' : 'md:w-32'}
                                />
                              </div>
                              {/* Duration Input */}
                              <div className="flex items-center w-full md:w-32">
                                <Input
                                  type="number"
                                  min={5}
                                  max={300}
                                  value={session.duration}
                                  onChange={e => handleSessionChange(idx, 'duration', Number(e.target.value))}
                                  placeholder="60"
                                  className={(!session.duration && sessionErrors) ? 'border-destructive md:w-32' : 'md:w-32'}
                                />
                                <span className="ml-2 text-xs text-muted-foreground">min</span>
                              </div>
                              {sessions.length > 1 && (
                                <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveSession(idx)}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={handleAddSession}>
                            + Add Session
                          </Button>
                          {sessionErrors && <div className="text-destructive text-sm mt-1">{sessionErrors}</div>}
                        </div>
                      )}
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
                              <FormLabel>Price (TND)</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <Input type="number" min={0} step={0.01} {...field} />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Set to 0 for free classes. All prices are in Tunisian Dinar (TND).
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

      {/* Coach's Created Classes Section */}
      {user?.role === 'coach' && (
        <section className="mt-10 relative z-0">
          <h2 className="text-2xl font-semibold mb-4">My Created Classes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myClassesState.length === 0 && <div className="text-muted-foreground">You have not created any classes yet.</div>}
            {myClassesState.map(classItem => {
              const canEdit = canModifyOrCancel(new Date(classItem.date));
              return (
                <Card key={classItem.id} className="w-full">
                  <CardHeader>
                    <CardTitle>{classItem.title}</CardTitle>
                    <CardDescription>{classItem.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {/* Calendar icon removed */}
                      <span>{classItem.date ? new Date(classItem.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{classItem.duration} min</span>
                      <Badge className="ml-2">{classItem.tags[0]}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Users className="h-4 w-4" />
                      <span>{classItem.enrolled}/{classItem.capacity} students booked</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => handleOpenEdit(classItem)}>
                        <Edit className="h-4 w-4 mr-1" /> Modify
                      </Button>
                      <Button size="sm" variant="destructive" disabled={!canEdit} onClick={() => handleOpenCancel(classItem)}>
                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </div>
                    {!canEdit && (
                      <div className="text-xs text-destructive mt-1">Cannot modify or cancel within 24 hours of class start.</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="block font-medium">Title</label>
            <Input value={editForm.title} onChange={e => handleEditChange('title', e.target.value)} />
            <label className="block font-medium">Description</label>
            <Textarea value={editForm.description} onChange={e => handleEditChange('description', e.target.value)} />
            <label className="block font-medium">Date</label>
            <Input type="text" value={editForm.date} onChange={e => handleEditChange('date', e.target.value)} placeholder="YYYY-MM-DD" />
            <label className="block font-medium">Time</label>
            <Input type="time" value={editForm.time} onChange={e => handleEditChange('time', e.target.value)} />
            <label className="block font-medium">Duration (min)</label>
            <Input type="number" value={editForm.duration} onChange={e => handleEditChange('duration', e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Class</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to cancel this class?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>No</Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>Yes, Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}