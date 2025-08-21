import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter as DialogFooterUI } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tag } from 'lucide-react';

const mockPromotions = [
    { id: 1, title: 'Free Guest Pass', description: 'Bring a friend for free', active: true },
    { id: 2, title: 'Discounted Membership', description: '20% off annual plans', active: false },
    { id: 3, title: 'Summer Bootcamp', description: 'Join our intensive summer program', active: true },
];

export default function GymPromotions() {
    const [promotions, setPromotions] = useState(mockPromotions);
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editPromotion, setEditPromotion] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', active: true });

    const filteredPromotions = useMemo(() =>
        promotions.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
        ),
        [promotions, search]
    );

    const handleAdd = () => {
        setEditPromotion(null);
        setForm({ title: '', description: '', active: true });
        setIsDialogOpen(true);
    };

    const handleEdit = (promotion) => {
        setEditPromotion(promotion);
        setForm({ title: promotion.title, description: promotion.description, active: promotion.active });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        setPromotions(promotions.filter(p => p.id !== id));
    };

    const handleSave = () => {
        if (editPromotion) {
            setPromotions(promotions.map(p =>
                p.id === editPromotion.id ? { ...editPromotion, ...form } : p
            ));
        } else {
            setPromotions([
                ...promotions,
                { id: Date.now(), ...form },
            ]);
        }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gym Promotions</h1>
                <Button onClick={handleAdd} variant="default"><Tag size={16} className="mr-2" />Add Promotion</Button>
            </div>
            <Input
                placeholder="Search promotions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mb-4"
            />
            <div className="grid gap-4">
                {filteredPromotions.map(promotion => (
                    <Card key={promotion.id} className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-semibold">{promotion.title}</div>
                            <div className="text-muted-foreground text-sm">{promotion.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={promotion.active} onCheckedChange={active => setPromotions(promotions.map(p => p.id === promotion.id ? { ...p, active } : p))} />
                            <Button size="sm" variant="outline" onClick={() => handleEdit(promotion)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(promotion.id)}>Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editPromotion ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <Input
                            placeholder="Description"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <Switch checked={form.active} onCheckedChange={active => setForm(f => ({ ...f, active }))} />
                            <span>{form.active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                    <DialogFooterUI>
                        <Button onClick={handleSave}>{editPromotion ? 'Save Changes' : 'Add Promotion'}</Button>
                    </DialogFooterUI>
                </DialogContent>
            </Dialog>
        </div>
    );
} 