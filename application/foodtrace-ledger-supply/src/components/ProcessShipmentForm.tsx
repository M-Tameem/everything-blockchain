import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // For qualityCertifications as multi-line/CSV
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X } from 'lucide-react';

interface ProcessShipmentFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProcessShipmentForm: React.FC<ProcessShipmentFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    processingType: '',
    processingLineId: '',
    dateProcessed: '', // Will be YYYY-MM-DDTHH:mm
    contaminationCheck: '', // PASSED or FAILED
    outputBatchId: '',
    expiryDate: '', // Will be YYYY-MM-DD
    processingLocation: '',
    qualityCertifications: '', // User will input as CSV, e.g., "Organic,Grade A"
    destinationDistributorId: '' // Alias of the distributor
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // --- FORM VALIDATION ---
    if (!formData.processingType.trim()) {
      toast({ title: "Validation Error", description: "Processing Type is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.processingLineId.trim()) {
      toast({ title: "Validation Error", description: "Processing Line ID is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.dateProcessed) {
      toast({ title: "Validation Error", description: "Date Processed is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.contaminationCheck) {
      toast({ title: "Validation Error", description: "Contamination Check status is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.outputBatchId.trim()) {
      toast({ title: "Validation Error", description: "Output Batch ID is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.expiryDate) {
      toast({ title: "Validation Error", description: "Expiry Date is required.", variant: "destructive" });
      setLoading(false); return;
    }
    if (!formData.processingLocation.trim()) {
      toast({ title: "Validation Error", description: "Processing Location is required.", variant: "destructive" });
      setLoading(false); return;
    }
    // Optional: Validate destinationDistributorId if it becomes mandatory
    // if (!formData.destinationDistributorId.trim()) {
    //   toast({ title: "Validation Error", description: "Destination Distributor ID is required.", variant: "destructive" });
    //   setLoading(false); return;
    // }


    try {
      // Prepare the payload to match test-server.js structure
      const dateProcessedISO = new Date(formData.dateProcessed).toISOString(); // from YYYY-MM-DDTHH:mm
      
      // For expiryDate (YYYY-MM-DD), convert to ISO string representing start of day UTC
      const expiryDateObj = new Date(formData.expiryDate + "T00:00:00.000Z"); // Treat as UTC date
      const expiryDateISO = expiryDateObj.toISOString();

      const qualityCertificationsArray = formData.qualityCertifications.trim()
        ? formData.qualityCertifications.split(',').map(cert => cert.trim()).filter(cert => cert)
        : []; // Handle empty or whitespace-only input

      const payloadForApi = {
        processingType: formData.processingType.trim(),
        processingLineId: formData.processingLineId.trim(),
        dateProcessed: dateProcessedISO,
        contaminationCheck: formData.contaminationCheck,
        outputBatchId: formData.outputBatchId.trim(),
        expiryDate: expiryDateISO,
        processingLocation: formData.processingLocation.trim(),
        qualityCertifications: qualityCertificationsArray,
        destinationDistributorId: formData.destinationDistributorId.trim()
      };

      console.log("Frontend: Sending process shipment payload:", JSON.stringify({ processorData: payloadForApi }, null, 2));
      
      // apiClient.processShipment will wrap payloadForApi under a "processorData" key
      await apiClient.processShipment(shipmentId, payloadForApi);

      toast({
        title: "Shipment processed successfully",
        description: "The shipment has been processed and is ready for distribution.",
      });
      onSuccess();
    } catch (error) {
      console.error("Frontend: Error processing shipment:", error);
      toast({
        title: "Error processing shipment",
        description: error instanceof Error ? error.message : "Failed to process shipment",
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
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <span>Process Shipment</span>
        </CardTitle>
        <CardDescription>
          Enter processing details for this shipment. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="processingType">Processing Type *</Label>
              <Input
                id="processingType"
                value={formData.processingType}
                onChange={(e) => handleInputChange('processingType', e.target.value)}
                required
                placeholder="e.g., Washing, Packaging, Juicing"
              />
            </div>
            <div>
              <Label htmlFor="processingLineId">Processing Line ID *</Label>
              <Input
                id="processingLineId"
                value={formData.processingLineId}
                onChange={(e) => handleInputChange('processingLineId', e.target.value)}
                required
                placeholder="e.g., LINE-001, JUICE-LINE-A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateProcessed">Date Processed *</Label>
              <Input
                id="dateProcessed"
                type="datetime-local" // Produces YYYY-MM-DDTHH:mm
                value={formData.dateProcessed}
                onChange={(e) => handleInputChange('dateProcessed', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contaminationCheck">Contamination Check *</Label>
              <Select
                value={formData.contaminationCheck}
                onValueChange={(value) => handleInputChange('contaminationCheck', value)}
                // required prop isn't standard on Select, validation handles it
              >
                <SelectTrigger id="contaminationCheck">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outputBatchId">Output Batch ID *</Label>
              <Input
                id="outputBatchId"
                value={formData.outputBatchId}
                onChange={(e) => handleInputChange('outputBatchId', e.target.value)}
                required
                placeholder="e.g., BATCH-2024-PROD-001"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date" // Produces YYYY-MM-DD
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="processingLocation">Processing Location *</Label>
            <Input
              id="processingLocation"
              value={formData.processingLocation}
              onChange={(e) => handleInputChange('processingLocation', e.target.value)}
              required
              placeholder="e.g., Main Processing Plant, City, State"
            />
          </div>

          {/* New Fields to match test-server.js */}
          <div>
            <Label htmlFor="qualityCertifications">Quality Certifications (Optional, comma-separated)</Label>
            <Textarea
              id="qualityCertifications"
              value={formData.qualityCertifications}
              onChange={(e) => handleInputChange('qualityCertifications', e.target.value)}
              placeholder="e.g., Organic, Grade A, ISO 9001"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="destinationDistributorId">Destination Distributor ID (Optional Alias)</Label>
            <Input
              id="destinationDistributorId"
              value={formData.destinationDistributorId}
              onChange={(e) => handleInputChange('destinationDistributorId', e.target.value)}
              placeholder="Enter alias of the next distributor"
            />
          </div>


          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Processing...' : 'Confirm Processing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProcessShipmentForm;