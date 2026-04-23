import { useState } from 'react';
import { Plus, Search, Trash2, AlertCircle } from 'lucide-react';
import { useInventoryStore } from '../stores/inventoryStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export default function Inventory() {
  const { user } = useAuthStore();
  const { items, removeItem, addItem } = useInventoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // New item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('count');
  const [newItemExpiry, setNewItemExpiry] = useState('');

  if (!user) return null;

  const householdItems = items.filter(i => i.householdId === user.householdId);
  
  const filteredItems = householdItems.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemExpiry) return;
    
    addItem({
      id: Math.random().toString(36).substr(2, 9),
      householdId: user.householdId,
      name: newItemName,
      quantity: Number(newItemQty),
      unit: newItemUnit,
      expiryDate: newItemExpiry,
      category: 'Uncategorized'
    });
    
    setNewItemName('');
    setNewItemQty('1');
    setNewItemUnit('count');
    setNewItemExpiry('');
  };

  const getExpiryStatus = (dateStr: string) => {
    const days = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    if (days < 0) return { label: 'Expired', color: 'bg-destructive text-destructive-foreground' };
    if (days <= 3) return { label: 'Expiring Soon', color: 'bg-orange-500 text-white' };
    return { label: 'Good', color: 'bg-emerald-500 text-white' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Your Fridge</h1>
          <p className="text-muted-foreground mt-1">Manage your ingredients and track expiration dates.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700">
              <Plus className="h-4 w-4 mr-2" /> Add Item manually
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Ingredient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={newItemName} onChange={e => setNewItemName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input id="qty" type="number" min="0.1" step="0.1" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" placeholder="e.g. cups, oz, count" value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" type="date" value={newItemExpiry} onChange={e => setNewItemExpiry(e.target.value)} required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" disabled={!newItemName || !newItemExpiry} className="bg-fuchsia-600">Save Item</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search inventory..." 
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-900">No items found</p>
            <p className="text-sm max-w-sm mt-1">Your fridge is looking empty. Scan your fridge or add items manually to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const status = getExpiryStatus(item.expiryDate);
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-1.5 w-full ${status.color}`}></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate pr-2">{item.name}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive -mr-2 -mt-2" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-2xl font-bold">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`${status.label === 'Expired' || status.label === 'Expiring Soon' ? 'border-destructive text-destructive' : ''}`}>
                          {status.label === 'Expired' ? 'Expired' : `Expires ${new Date(item.expiryDate).toLocaleDateString()}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
