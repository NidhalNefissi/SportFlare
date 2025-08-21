import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Star, Share2 } from 'lucide-react';
import { Program } from '@/types';
import { mockPrograms } from '@/data/mockData';
import { ShareButton } from '@/components/ShareButton';
import ProgramEnrollment from '../components/ProgramEnrollment';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Programs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [filterGym, setFilterGym] = useState('all');
    const navigate = useNavigate();

    // Get URL parameters for preselected gym filter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const gymFilter = urlParams.get('gym');
        if (gymFilter) {
            setFilterGym(gymFilter);
        }
    }, []);

    // Get unique gyms from programs (from classes within programs)
    const uniqueGyms = useMemo(() => {
        const gyms = new Set<string>();
        mockPrograms.forEach(program => {
            program.classes.forEach(classItem => {
                if (classItem.gym?.name) {
                    gyms.add(classItem.gym.name);
                }
            });
        });
        return Array.from(gyms).sort();
    }, []);

    // Format date for display
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    // Filter programs based on search query and gym
    const filteredPrograms = mockPrograms.filter(program => {
        const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesGym = filterGym === 'all' || program.classes.some(classItem => classItem.gym?.name === filterGym);

        return matchesSearch && matchesGym;
    });

    const handleEnroll = (program: Program) => {
        setSelectedProgram(program);
        setIsEnrollmentOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
                <p className="text-muted-foreground">Discover and join comprehensive fitness programs.</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search programs, coaches, or keywords..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterGym} onValueChange={setFilterGym}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Gym" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Gyms</SelectItem>
                        {uniqueGyms.map(gym => (
                            <SelectItem key={gym} value={gym}>{gym}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>

                {/* All Tab */}
                <TabsContent value="all" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPrograms.map((program) => (
                            <ProgramCard
                                key={program.id}
                                program={program}
                                formatDate={formatDate}
                                onClick={() => navigate(`/programs/${program.id}`)}
                                onEnroll={() => handleEnroll(program)}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* Popular Tab */}
                <TabsContent value="popular" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...filteredPrograms].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3).map((program) => (
                            <ProgramCard
                                key={program.id}
                                program={program}
                                formatDate={formatDate}
                                onClick={() => navigate(`/programs/${program.id}`)}
                                onEnroll={() => handleEnroll(program)}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
            {selectedProgram && (
                <ProgramEnrollment
                    program={selectedProgram}
                    open={isEnrollmentOpen}
                    onOpenChange={setIsEnrollmentOpen}
                    onEnrolled={() => setIsEnrollmentOpen(false)}
                />
            )}
        </div>
    );
}

interface ProgramCardProps {
    program: Program;
    formatDate: (date: Date) => string;
    onClick: () => void;
    onEnroll: () => void;
}

const ProgramCard = ({ program, formatDate, onClick, onEnroll }: ProgramCardProps) => {
    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
            <CardContent className="p-0">
                <div className="h-40 bg-muted" />
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{program.title}</span>
                        <Badge>{program.tags[0]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{program.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {program.tags.map((tag, i) => (
                            <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>{program.duration} week program</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>{program.classes.length} classes included</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>{program.rating}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary" />
                            <span className="text-sm">{program.coach.name}</span>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <ShareButton 
                                url={`${window.location.origin}/programs/${program.id}`}
                                title={`Check out ${program.title} on SportFlare`}
                                description={program.description}
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                            />
                            <span className="font-medium">{program.price} TND</span>
                            <Button size="sm" onClick={e => { e.stopPropagation(); onEnroll(); }}>
                                Enroll in Program
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 