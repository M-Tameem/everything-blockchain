import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Building, X } from 'lucide-react';

interface ReceiveShipmentFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReceiveShipmentForm: React.FC<ReceiveShipmentFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateReceived: '',
    retailerLineId: '',
    productNameRetail: '',
    shelfLife: '',
    sellByDate: '',
    retailerExpiryDate: '',
    storeId: '',
    storeLocation: '',
    price: '',
    qrCodeLink: ''
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- FORM VALIDATION ---
    if (!formData.dateReceived) {
      toast({ title: "Validation Error", description: "Date Received is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.storeLocation.trim()) {
      toast({ title: "Validation Error", description: "Store Location is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.storeId.trim()) {
      toast({ title: "Validation Error", description: "Store ID is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.retailerLineId.trim()) {
      toast({ title: "Validation Error", description: "Retailer Line ID is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.shelfLife.trim()) {
      toast({ title: "Validation Error", description: "Shelf Life is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.sellByDate) {
      toast({ title: "Validation Error", description: "Sell By Date is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.price.trim()) {
      toast({ title: "Validation Error", description: "Retail Price is required.", variant: "destructive" });
      setLoading(false); return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast({ title: "Invalid Price", description: "Price must be a valid positive number.", variant: "destructive" });
      setLoading(false); return;
    }
    // --- END OF FORM VALIDATION ---

    try {
      // Prepare the payload with proper datetime conversion
      const dateReceivedISO = new Date(formData.dateReceived).toISOString();
      
      // Handle sell by date (date only, start of day)
      const sellByDateObj = new Date(formData.sellByDate + "T00:00:00.000Z");
      const sellByDateISO = sellByDateObj.toISOString();

      // Handle retailer expiry date (optional)
      let retailerExpiryDateISO = "";
      if (formData.retailerExpiryDate.trim()) {
        const retailerExpiryDateObj = new Date(formData.retailerExpiryDate + "T00:00:00.000Z");
        retailerExpiryDateISO = retailerExpiryDateObj.toISOString();
      }

      const payloadForApi = {
        dateReceived: dateReceivedISO,
        retailerLineId: formData.retailerLineId.trim(),
        productNameRetail: formData.productNameRetail.trim(),
        shelfLife: formData.shelfLife.trim(),
        sellByDate: sellByDateISO,
        retailerExpiryDate: retailerExpiryDateISO,
        storeId: formData.storeId.trim(),
        storeLocation: formData.storeLocation.trim(),
        price: priceValue,
        qrCodeLink: formData.qrCodeLink.trim()
      };

      console.log("Frontend: Sending receive shipment payload:", JSON.stringify({ retailerData: payloadForApi }, null, 2));
      
      // apiClient.receiveShipment will wrap payloadForApi under a "retailerData" key
      await apiClient.receiveShipment(shipmentId, payloadForApi);

      toast({
        title: "Shipment received successfully",
        description: "The shipment has been received and is available in store.",
      });
      onSuccess();
    } catch (error) {
      console.error("Frontend: Error receiving shipment:", error);
      toast({
        title: "Error receiving shipment",
        description: error instanceof Error ? error.message : "Failed to receive shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Receive Shipment</span>
        </CardTitle>
        <CardDescription>
          Enter retail information for the received shipment. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateReceived">Date Received *</Label>
              <Input
                id="dateReceived"
                type="datetime-local"
                value={formData.dateReceived}
                onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Retail Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                placeholder="e.g., 12.99"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeLocation">Store Location *</Label>
              <Input
                id="storeLocation"
                value={formData.storeLocation}
                onChange={(e) => handleInputChange('storeLocation', e.target.value)}
                required
                placeholder="e.g., Main Street Store, City, State"
              />
            </div>
            <div>
              <Label htmlFor="storeId">Store ID *</Label>
              <Input
                id="storeId"
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                required
                placeholder="e.g., STORE-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retailerLineId">Retailer Line ID *</Label>
              <Input
                id="retailerLineId"
                value={formData.retailerLineId}
                onChange={(e) => handleInputChange('retailerLineId', e.target.value)}
                required
                placeholder="e.g., RETAIL-LINE-001, CHECKOUT-A"
              />
            </div>
            <div>
              <Label htmlFor="shelfLife">Shelf Life *</Label>
              <Input
                id="shelfLife"
                value={formData.shelfLife}
                onChange={(e) => handleInputChange('shelfLife', e.target.value)}
                required
                placeholder="e.g., 7 days, 2 weeks"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sellByDate">Sell By Date *</Label>
              <Input
                id="sellByDate"
                type="date"
                value={formData.sellByDate}
                onChange={(e) => handleInputChange('sellByDate', e.target.value)}
                required
              />
            </div>
            </div>
            <div>
              <Label htmlFor="productNameRetail">Product Name (Retail)</Label>
              <Input
                id="productNameRetail"
                value={formData.productNameRetail}
                onChange={(e) => handleInputChange('productNameRetail', e.target.value)}
                placeholder="Retail-specific product name (optional)"
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retailerExpiryDate">Retailer Expiry Date</Label>
              <Input
                id="retailerExpiryDate"
                type="date"
                value={formData.retailerExpiryDate}
                onChange={(e) => handleInputChange('retailerExpiryDate', e.target.value)}
                placeholder="Optional retailer-specific expiry"
              />
            </div>

            </div>
            <div>
              <Label htmlFor="qrCodeLink">QR Code Link (Optional)</Label>
              <Input
                id="qrCodeLink"
                type="url"
                value={formData.qrCodeLink}
                onChange={(e) => handleInputChange('qrCodeLink', e.target.value)}
                placeholder="https://example.com/track/shipment-id"
              />
            </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Receiving...' : 'Receive Shipment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiveShipmentForm;