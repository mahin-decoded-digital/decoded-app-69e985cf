import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useHouseholdStore } from '../stores/householdStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { UserPlus, Edit, Trash2, Heart } from 'lucide-react';
import { Stage, HouseholdMember } from '../types';

export default function Profile() {
  const { user } = useAuthStore();
  const { households, addMember, updateMember, removeMember } = useHouseholdStore();
  
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (!user || user.role !== 'CLIENT') return null;

  const household = households[user.householdId];
  if (!household) return null;

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      if (editingMember.id.startsWith('new_')) {
        addMember(user.householdId, { ...editingMember, id: Math.random().toString(36).substr(2, 9) });
      } else {
        updateMember(user.householdId, editingMember);
      }
    }
    setIsAddOpen(false);
    setEditingMember(null);
  };

  const openAddMember = () => {
    setEditingMember({
      id: 'new_',
      name: '',
      stage: 'PRECONCEPTION',
      allergies: [],
      medicalConditions: [],
      dietaryRestrictions: [],
      servingsMultiplier: 1
    });
    setIsAddOpen(true);
  };

  const handleListEdit = (field: 'allergies' | 'medicalConditions' | 'dietaryRestrictions', val: string) => {
    if (!editingMember) return;
    const items = val.split(',').map(s => s.trim()).filter(Boolean);
    setEditingMember({ ...editingMember, [field]: items });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Household Profile</h1>
        <p className="text-muted-foreground mt-2">Manage family members, health stages, and dietary constraints.</p>
      </div>

      <div className="flex justify-between items-center bg-fuchsia-50 p-4 rounded-lg border border-fuchsia-100">
        <div>
          <h2 className="font-semibold text-fuchsia-900 text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-fuchsia-600" />
            {household.name}
          </h2>
          <p className="text-sm text-fuchsia-700">{household.members.length} members</p>
        </div>
        <Button onClick={openAddMember} className="bg-fuchsia-600 hover:bg-fuchsia-700">
          <UserPlus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {household.members.map(member => (
          <Card key={member.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="mt-1">Servings Multiplier: {member.servingsMultiplier}x</CardDescription>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-fuchsia-600" onClick={() => { setEditingMember(member); setIsAddOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeMember(user.householdId, member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Stage</span>
                <Badge className="bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 border-none">
                  {member.stage.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Allergies</span>
                <div className="flex flex-wrap gap-1">
                  {member.allergies.length === 0 ? <span className="text-sm text-slate-400">None</span> : 
                    member.allergies.map((a, i) => <Badge key={i} variant="outline" className="text-xs bg-slate-50">{a}</Badge>)
                  }
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Medical Conditions</span>
                <div className="flex flex-wrap gap-1">
                  {member.medicalConditions.length === 0 ? <span className="text-sm text-slate-400">None</span> : 
                    member.medicalConditions.map((a, i) => <Badge key={i} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">{a}</Badge>)
                  }
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Dietary Restrictions</span>
                <div className="flex flex-wrap gap-1">
                  {member.dietaryRestrictions.length === 0 ? <span className="text-sm text-slate-400">None</span> : 
                    member.dietaryRestrictions.map((a, i) => <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{a}</Badge>)
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if(!open) setEditingMember(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember?.id.startsWith('new_') ? 'Add Member' : 'Edit Member'}</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <form onSubmit={handleSaveMember} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Pregnancy / Postpartum Stage</Label>
                <Select value={editingMember.stage} onValueChange={(v) => setEditingMember({...editingMember, stage: v as Stage})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRECONCEPTION">Preconception</SelectItem>
                    <SelectItem value="TRIMESTER_1">First Trimester</SelectItem>
                    <SelectItem value="TRIMESTER_2">Second Trimester</SelectItem>
                    <SelectItem value="TRIMESTER_3">Third Trimester</SelectItem>
                    <SelectItem value="POSTPARTUM">4th Trimester (Postpartum)</SelectItem>
                    <SelectItem value="RECOVERY">Recovery / Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Allergies (comma separated)</Label>
                <Input 
                  placeholder="e.g. Peanuts, Shellfish" 
                  value={editingMember.allergies.join(', ')} 
                  onChange={e => handleListEdit('allergies', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Medical Conditions (comma separated)</Label>
                <Input 
                  placeholder="e.g. Gestational Diabetes, Anemia" 
                  value={editingMember.medicalConditions.join(', ')} 
                  onChange={e => handleListEdit('medicalConditions', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Dietary Restrictions (comma separated)</Label>
                <Input 
                  placeholder="e.g. Vegetarian, Halal" 
                  value={editingMember.dietaryRestrictions.join(', ')} 
                  onChange={e => handleListEdit('dietaryRestrictions', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Servings Multiplier</Label>
                <Input 
                  type="number" step="0.1" min="0.1"
                  value={editingMember.servingsMultiplier} 
                  onChange={e => setEditingMember({...editingMember, servingsMultiplier: Number(e.target.value)})} 
                  required 
                />
                <p className="text-xs text-muted-foreground">Adjust portion size logic (e.g. 1 for adult female, 1.5 for adult male, 0.5 for toddler).</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditingMember(null); }}>Cancel</Button>
                <Button type="submit" className="bg-fuchsia-600">Save Profile</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
