import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, Loader2, Plus, Sparkles } from 'lucide-react';
import { useInventoryStore } from '../stores/inventoryStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const mockDetectedItems = [
  { name: 'Apples', quantity: 6, unit: 'count', category: 'Produce', estimatedExpiryDays: 14 },
  { name: 'Milk', quantity: 1, unit: 'gallon', category: 'Dairy', estimatedExpiryDays: 7 },
  { name: 'Greek Yogurt', quantity: 2, unit: 'tubs', category: 'Dairy', estimatedExpiryDays: 10 },
  { name: 'Spinach', quantity: 1, unit: 'bags', category: 'Produce', estimatedExpiryDays: 5 },
  { name: 'Carrots', quantity: 1, unit: 'bunch', category: 'Produce', estimatedExpiryDays: 21 },
];

export default function FridgeScan() {
  const [step, setStep] = useState<'IDLE' | 'SCANNING' | 'RESULTS'>('IDLE');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { addBulkItems } = useInventoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleScan = () => {
    setStep('SCANNING');
    setTimeout(() => {
      setSelectedItems(mockDetectedItems.map((_, i) => i)); // select all by default
      setStep('RESULTS');
    }, 2500);
  };

  const toggleItem = (index: number) => {
    setSelectedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAddToInventory = () => {
    if (!user) return;
    const itemsToAdd = selectedItems.map(index => {
      const item = mockDetectedItems[index];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + item.estimatedExpiryDays);
      return {
        id: Math.random().toString(36).substr(2, 9),
        householdId: user.householdId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiryDate: expiry.toISOString().split('T')[0],
      };
    });
    addBulkItems(itemsToAdd);
    navigate('/inventory');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Fridge Scanner</h1>
        <p className="text-muted-foreground mt-2">Let AI catalog your ingredients and detect expiry dates.</p>
      </div>

      {step === 'IDLE' && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="border-2 border-dashed hover:border-fuchsia-400 transition-colors cursor-pointer" onClick={handleScan}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-fuchsia-100 p-4 rounded-full mb-4">
                <Camera className="h-8 w-8 text-fuchsia-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Take a Photo</h3>
              <p className="text-sm text-muted-foreground">Snap a picture of your open fridge or pantry shelves.</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-fuchsia-400 transition-colors cursor-pointer" onClick={handleScan}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-pink-100 p-4 rounded-full mb-4">
                <Upload className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Image</h3>
              <p className="text-sm text-muted-foreground">Choose a photo from your gallery.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'SCANNING' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-fuchsia-600" />
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-fuchsia-500" /> Analyzing Image...
              </h3>
              <p className="text-muted-foreground">Identifying ingredients, estimating quantities, and predicting shelf life.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'RESULTS' && (
        <Card className="border-fuchsia-200">
          <CardHeader className="bg-fuchsia-50/50">
            <CardTitle>Items Detected</CardTitle>
            <CardDescription>We found {mockDetectedItems.length} items. Select the ones you want to add to your inventory.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockDetectedItems.map((item, idx) => {
                const isSelected = selectedItems.includes(idx);
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-fuchsia-50/30' : ''}`}
                    onClick={() => toggleItem(idx)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded border flex items-center justify-center ${isSelected ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} {item.unit}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white">
                      Expires in ~{item.estimatedExpiryDays}d
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-slate-50 border-t flex justify-between">
            <Button variant="outline" onClick={() => setStep('IDLE')}>Cancel</Button>
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={handleAddToInventory} disabled={selectedItems.length === 0}>
              <Plus className="h-4 w-4 mr-2" /> Add {selectedItems.length} Items to Fridge
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
