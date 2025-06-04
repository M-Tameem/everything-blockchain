import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMyShipments } from '@/hooks/use-my-shipments';
import { useAliases } from '@/hooks/use-aliases';
import { apiClient } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface InputRow {
  shipmentId: string;
}
interface ProductRow {
  newShipmentId: string;
  productName: string;
  description: string;
  quantity: string;
  unitOfMeasure: string;
}

const TransformProductsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const myShipments = useMyShipments();
  const distributorAliases = useAliases('distributor');

  const consumable = myShipments.filter(s =>
    ['PROCESSED', 'CERTIFIED', 'DELIVERED'].includes(s.status)
  );

  const [inputs, setInputs] = useState<InputRow[]>([{ shipmentId: '' }]);
  const [products, setProducts] = useState<ProductRow[]>([{
    newShipmentId: '',
    productName: '',
    description: '',
    quantity: '',
    unitOfMeasure: 'kg'
  }]);
  const [procData, setProcData] = useState({
    processingType: '',
    processingLineId: '',
    dateProcessed: '',
    outputBatchId: '',
    expiryDate: '',
    destinationDistributorId: ''
  });
  const [loading, setLoading] = useState(false);

  const addInputRow = () => setInputs(prev => [...prev, { shipmentId: '' }]);
  const removeInputRow = (idx: number) => setInputs(prev => prev.filter((_,i)=>i!==idx));
  const updateInput = (idx: number, val: string) => setInputs(prev => prev.map((r,i)=>i===idx?{ shipmentId: val }:r));

  const addProductRow = () => setProducts(p => [...p,{ newShipmentId:'', productName:'', description:'', quantity:'', unitOfMeasure:'kg'}]);
  const removeProductRow = (idx:number) => setProducts(p => p.filter((_,i)=>i!==idx));
  const updateProduct = (idx:number, field:keyof ProductRow, val:string)=>setProducts(p=>p.map((r,i)=>i===idx?{...r,[field]:val}:r));

  const updateProc = (field: keyof typeof procData, val: string)=> setProcData(d=>({...d,[field]:val}));

  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();
    const selected = inputs.map(i=>i.shipmentId).filter(id=>id);
    if(selected.length===0){toast({title:'Select input shipments',variant:'destructive'});return;}
    const output = products.filter(p=>p.productName && p.quantity);
    if(output.length===0){toast({title:'Add at least one product',variant:'destructive'});return;}
    setLoading(true);
    try{
      const inputConsumption = selected.map(id=>({ shipmentId:id }));
      const newProducts = output.map(p=>({
        newShipmentId: p.newShipmentId || `SHIP-${Date.now()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`,
        productName: p.productName.trim(),
        description: p.description.trim(),
        quantity: parseFloat(p.quantity),
        unitOfMeasure: p.unitOfMeasure
      }));
      const payloadProc = {
        processingType: procData.processingType.trim(),
        processingLineId: procData.processingLineId.trim(),
        dateProcessed: procData.dateProcessed ? new Date(procData.dateProcessed).toISOString() : new Date().toISOString(),
        outputBatchId: procData.outputBatchId.trim(),
        expiryDate: procData.expiryDate ? new Date(procData.expiryDate+ 'T00:00:00Z').toISOString() : '',
        processingLocation: 'Transformation Plant',
        qualityCertifications: [],
        destinationDistributorId: procData.destinationDistributorId.trim()
      };
      await apiClient.transformProducts(inputConsumption,newProducts,payloadProc);
      toast({title:'Transformation complete'});
      navigate('/dashboard');
    }catch(err:any){
      toast({title:'Error', description: err?.message || 'Failed', variant:'destructive'});
    }finally{
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Transform Products</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {inputs.map((row,idx)=> (
                  <div key={idx} className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label>Input Shipment</Label>
                      <Select value={row.shipmentId} onValueChange={val=>updateInput(idx,val)}>
                        <SelectTrigger><SelectValue placeholder="Select shipment" /></SelectTrigger>
                        <SelectContent>
                          {consumable.map(s=> (
                            <SelectItem key={s.id || s.shipmentID} value={s.id || s.shipmentID}>{s.productName} ({s.id || s.shipmentID})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {inputs.length>1 && (<Button type="button" variant="outline" onClick={()=>removeInputRow(idx)}>Remove</Button>)}
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addInputRow}>Add Shipment</Button>
              </div>

              <div className="space-y-4">
                {products.map((p,idx)=>(
                  <div key={idx} className="border p-3 rounded-md space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>New Shipment ID</Label>
                        <Input value={p.newShipmentId} onChange={e=>updateProduct(idx,'newShipmentId',e.target.value)} />
                      </div>
                      <div>
                        <Label>Product Name *</Label>
                        <Input value={p.productName} onChange={e=>updateProduct(idx,'productName',e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={p.description} onChange={e=>updateProduct(idx,'description',e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantity *</Label>
                        <Input type="number" value={p.quantity} onChange={e=>updateProduct(idx,'quantity',e.target.value)} required />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select value={p.unitOfMeasure} onValueChange={val=>updateProduct(idx,'unitOfMeasure',val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="liters">liters</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {products.length>1 && (<Button type="button" variant="outline" onClick={()=>removeProductRow(idx)}>Remove Product</Button>)}
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addProductRow}>Add Product</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Processing Type *</Label>
                  <Input value={procData.processingType} onChange={e=>updateProc('processingType',e.target.value)} required />
                </div>
                <div>
                  <Label>Processing Line ID</Label>
                  <Input value={procData.processingLineId} onChange={e=>updateProc('processingLineId',e.target.value)} />
                </div>
                <div>
                  <Label>Date Processed</Label>
                  <Input type="datetime-local" value={procData.dateProcessed} onChange={e=>updateProc('dateProcessed',e.target.value)} />
                </div>
                <div>
                  <Label>Output Batch ID</Label>
                  <Input value={procData.outputBatchId} onChange={e=>updateProc('outputBatchId',e.target.value)} />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={procData.expiryDate} onChange={e=>updateProc('expiryDate',e.target.value)} />
                </div>
                <div>
                  <Label>Destination Distributor</Label>
                  <Select value={procData.destinationDistributorId} onValueChange={val=>updateProc('destinationDistributorId',val)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {distributorAliases.map(a=> (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={()=>navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading? 'Submitting...' : 'Transform'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransformProductsPage;
