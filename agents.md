# Supply Chain Management System - Frontend & API Planning Specification

## System Overview

This is a blockchain-based food supply chain tracking system built on Hyperledger Fabric. The system tracks food shipments from farm to retail, with optional organic certification, quality control, and recall management capabilities.

### Key Entities
- **Shipment**: The core entity representing a food product moving through the supply chain
- **IdentityInfo**: Registered participants with roles and permissions
- **CertificationRecord**: Organic certification data for shipments
- **RecallInfo**: Information about product recalls

### User Roles
- **Admin**: System administrator with full access
- **Farmer**: Creates initial shipments
- **Processor**: Processes raw materials, can transform products
- **Distributor**: Handles logistics and distribution
- **Retailer**: Receives and sells products to consumers
- **Certifier**: Performs organic certification inspections

### Shipment Status Flow
```
CREATED (Farmer) → [PENDING_CERTIFICATION] → [CERTIFIED/CERTIFICATION_REJECTED] → 
PROCESSED (Processor) → DISTRIBUTED (Distributor) → DELIVERED (Retailer) → [CONSUMED]

Special states:
- RECALLED (can occur at any stage)
- CONSUMED_IN_PROCESSING (input shipments used in transformation)
```

---

## Actor: Admin

### Action: Bootstrap System
- **Chaincode Function**: `BootstrapLedger`
- **Type**: transaction
- **Parameters**: None
- **Output**: Success/Error message
- **Effect**: Creates the first admin identity in the system
- **Frontend**:
  - Button: "Initialize System" (only shown if no admins exist)
  - Display: Success notification

### Action: Register Identity
- **Chaincode Function**: `RegisterIdentity`
- **Type**: transaction
- **Parameters**:
  - `targetFullID` (string): Full X.509 identity
  - `shortName` (string): Alias for the identity
  - `enrollmentID` (string): Enrollment ID
- **JSON Input**:
```json
{
  "targetFullID": "x509::CN=farmer1::OU=client",
  "shortName": "farmer1",
  "enrollmentID": "farmer1"
}
```
- **Output**: Success/Error message
- **Frontend**:
  - Form: Fields for targetFullID, shortName, enrollmentID
  - Button: "Register Identity"
  - Table: List of registered identities

### Action: Assign Role
- **Chaincode Function**: `AssignRoleToIdentity`
- **Type**: transaction
- **Parameters**:
  - `identityOrAlias` (string): Identity ID or alias
  - `role` (string): Role to assign (farmer/processor/distributor/retailer/certifier)
- **JSON Input**:
```json
{
  "identityOrAlias": "farmer1",
  "role": "farmer"
}
```
- **Output**: Success/Error message
- **Frontend**:
  - Form: Dropdown for identity selection, dropdown for role
  - Button: "Assign Role"

### Action: Make Admin
- **Chaincode Function**: `MakeIdentityAdmin`
- **Type**: transaction
- **Parameters**:
  - `identityOrAlias` (string): Identity to make admin
- **Output**: Success/Error message
- **Frontend**:
  - Select: Choose identity from dropdown
  - Button: "Grant Admin Privileges"

### Action: Archive Shipment
- **Chaincode Function**: `ArchiveShipment`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to archive
  - `archiveReason` (string): Reason for archiving
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "archiveReason": "Obsolete record"
}
```
- **Output**: Success/Error message
- **Frontend**:
  - Form: Shipment ID field, reason textarea
  - Button: "Archive Shipment"

### Action: View All Identities
- **Chaincode Function**: `GetAllIdentities`
- **Type**: query
- **Parameters**: None
- **Output**: Array of IdentityInfo objects
- **Frontend**:
  - Table: Display all identities with columns for ID, alias, roles, admin status
  - Search/filter functionality

### Action: View All Shipments
- **Chaincode Function**: `GetAllShipments`
- **Type**: query
- **Parameters**:
  - `pageSize` (string): Number of results per page
  - `bookmark` (string): Pagination bookmark
- **Output**: PaginatedShipmentResponse
- **Frontend**:
  - Table: Paginated shipment list
  - Filters: Status, date range, owner
  - Pagination controls

---

## Actor: Farmer

### Action: Create Shipment
- **Chaincode Function**: `CreateShipment`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Unique shipment identifier
  - `productName` (string): Name of the product
  - `description` (string): Product description
  - `quantity` (float64): Quantity
  - `unitOfMeasure` (string): Unit (kg, tons, etc.)
  - `farmerDataJSON` (string): JSON string with farmer-specific data
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "productName": "Organic Tomatoes",
  "description": "Fresh organic tomatoes from sustainable farm",
  "quantity": 500,
  "unitOfMeasure": "kg",
  "farmerDataJSON": "{\"farmerName\":\"Green Acres Farm\",\"farmLocation\":\"California, USA\",\"cropType\":\"Tomatoes\",\"plantingDate\":\"2024-03-15T00:00:00Z\",\"fertilizerUsed\":\"Organic compost\",\"certificationDocumentHash\":\"hash123\",\"harvestDate\":\"2024-07-20T00:00:00Z\",\"farmingPractice\":\"Organic\",\"destinationProcessorId\":\"processor1\"}"
}
```
- **Output**: Success message with shipment ID
- **Frontend**:
  - Multi-step form:
    1. Basic Info: shipmentID, productName, description, quantity, unitOfMeasure
    2. Farm Details: farmerName, farmLocation, cropType, farmingPractice
    3. Dates: plantingDate, harvestDate (date pickers)
    4. Additional: fertilizerUsed, certificationDocumentHash
    5. Destination: Select processor from dropdown
  - Button: "Create Shipment"
  - Success: Show shipment details card

### Action: View My Shipments
- **Chaincode Function**: `GetMyShipments`
- **Type**: query
- **Parameters**:
  - `pageSize` (string): Results per page
  - `bookmark` (string): Pagination bookmark
- **Output**: PaginatedShipmentResponse
- **Frontend**:
  - Dashboard: Cards showing active shipments
  - Table: Full shipment list with status indicators
  - Actions: View details, Submit for certification (if applicable)

### Action: Submit for Certification
- **Chaincode Function**: `SubmitForCertification`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to certify
- **Output**: Success/Error message
- **Frontend**:
  - Button: "Submit for Certification" on shipment card
  - Status update: Shows "PENDING_CERTIFICATION"

### Action: Initiate Recall
- **Chaincode Function**: `InitiateRecall`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to recall
  - `recallID` (string): Unique recall event ID
  - `reason` (string): Recall reason
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "recallID": "RECALL001",
  "reason": "Potential contamination detected"
}
```
- **Output**: Success/Error message
- **Frontend**:
  - Modal: Recall form with shipmentID (pre-filled), recallID (auto-generated), reason textarea
  - Button: "Initiate Recall" (red/warning style)
  - Confirmation dialog

---

## Actor: Processor

### Action: Process Shipment
- **Chaincode Function**: `ProcessShipment`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to process
  - `processorDataJSON` (string): JSON string with processing data
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "processorDataJSON": "{\"dateProcessed\":\"2024-07-25T00:00:00Z\",\"processingType\":\"Washing and Packaging\",\"processingLineId\":\"LINE-A1\",\"processingLocation\":\"Processing Plant A\",\"contaminationCheck\":\"PASSED\",\"outputBatchId\":\"BATCH001\",\"expiryDate\":\"2024-08-10T00:00:00Z\",\"qualityCertifications\":[\"ISO-22000\",\"HACCP\"],\"destinationDistributorId\":\"distributor1\"}"
}
```
- **Output**: Success message
- **Frontend**:
  - Form sections:
    1. Processing Info: dateProcessed, processingType, processingLineId, processingLocation
    2. Quality: contaminationCheck (dropdown: PASSED/FAILED), qualityCertifications (multi-select)
    3. Output: outputBatchId, expiryDate
    4. Destination: Select distributor
  - Button: "Process Shipment"

### Action: Transform Products
- **Chaincode Function**: `TransformAndCreateProducts`
- **Type**: transaction
- **Parameters**:
  - `inputShipmentConsumptionJSON` (string): Array of input shipments
  - `newProductsDataJSON` (string): Array of output products
  - `processorDataJSON` (string): Processing details
- **JSON Input**:
```json
{
  "inputShipmentConsumptionJSON": "[{\"shipmentId\":\"SHIP001\"},{\"shipmentId\":\"SHIP002\"}]",
  "newProductsDataJSON": "[{\"newShipmentId\":\"SHIP003\",\"productName\":\"Tomato Sauce\",\"description\":\"Organic tomato sauce\",\"quantity\":300,\"unitOfMeasure\":\"liters\"}]",
  "processorDataJSON": "{\"dateProcessed\":\"2024-07-26T00:00:00Z\",\"processingType\":\"Cooking and Bottling\",\"processingLineId\":\"LINE-B2\",\"processingLocation\":\"Processing Plant B\",\"contaminationCheck\":\"PASSED\",\"outputBatchId\":\"SAUCE-BATCH001\",\"expiryDate\":\"2025-07-26T00:00:00Z\",\"qualityCertifications\":[\"Organic\"],\"destinationDistributorId\":\"distributor1\"}"
}
```
- **Output**: Success message with new shipment IDs
- **Frontend**:
  - Multi-step wizard:
    1. Select Input Shipments: Checkbox list of owned shipments
    2. Define Output Products: Dynamic form to add products
    3. Processing Details: Same as ProcessShipment form
  - Button: "Transform Products"
  - Result: Show created shipment cards

### Action: View Processing Queue
- **Chaincode Function**: `GetMyShipments` (filtered by status)
- **Type**: query
- **Frontend**:
  - Dashboard: Incoming shipments (STATUS: CREATED or CERTIFIED)
  - Actions per shipment: Process, Transform, View Details

---

## Actor: Distributor

### Action: Distribute Shipment
- **Chaincode Function**: `DistributeShipment`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to distribute
  - `distributorDataJSON` (string): Distribution details
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "distributorDataJSON": "{\"pickupDateTime\":\"2024-07-27T08:00:00Z\",\"deliveryDateTime\":\"2024-07-27T18:00:00Z\",\"distributionLineId\":\"TRUCK-01\",\"temperatureRange\":\"2-8°C\",\"storageTemperature\":5.5,\"transitLocationLog\":[\"Warehouse A\",\"Distribution Center B\",\"Store C\"],\"transportConditions\":\"Refrigerated truck\",\"distributionCenter\":\"DC-West\",\"destinationRetailerId\":\"retailer1\"}"
}
```
- **Output**: Success message
- **Frontend**:
  - Form sections:
    1. Schedule: pickupDateTime, deliveryDateTime (datetime pickers)
    2. Logistics: distributionLineId, distributionCenter
    3. Conditions: temperatureRange, storageTemperature, transportConditions
    4. Route: transitLocationLog (dynamic list)
    5. Destination: Select retailer
  - Button: "Distribute Shipment"

### Action: Track Distributions
- **Chaincode Function**: `GetMyShipments`
- **Type**: query
- **Frontend**:
  - Map view: Show shipments in transit
  - Table: Distribution schedule
  - Status indicators: On-time, delayed, delivered

---

## Actor: Retailer

### Action: Receive Shipment
- **Chaincode Function**: `ReceiveShipment`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to receive
  - `retailerDataJSON` (string): Retail details
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "retailerDataJSON": "{\"dateReceived\":\"2024-07-28T00:00:00Z\",\"retailerLineId\":\"RECV-001\",\"productNameRetail\":\"Premium Organic Tomatoes\",\"shelfLife\":\"7 days\",\"sellByDate\":\"2024-08-04T00:00:00Z\",\"retailerExpiryDate\":\"2024-08-04T00:00:00Z\",\"storeId\":\"STORE-001\",\"storeLocation\":\"Main Street Store\",\"price\":4.99,\"qrCodeLink\":\"https://trace.example.com/SHIP001\"}"
}
```
- **Output**: Success message
- **Frontend**:
  - Receiving form:
    1. Receipt Info: dateReceived, retailerLineId
    2. Product Details: productNameRetail, shelfLife, price
    3. Dates: sellByDate, retailerExpiryDate
    4. Store Info: storeId, storeLocation
    5. Traceability: qrCodeLink (auto-generated option)
  - Button: "Confirm Receipt"

### Action: View Inventory
- **Chaincode Function**: `GetMyShipments`
- **Type**: query
- **Frontend**:
  - Dashboard: Current inventory with expiry warnings
  - Actions: Generate QR code, View supply chain history

---

## Actor: Certifier

### Action: View Pending Certifications
- **Chaincode Function**: `GetShipmentsByStatus`
- **Type**: query
- **Parameters**:
  - `statusToQuery` (string): "PENDING_CERTIFICATION"
  - `pageSize` (string): Results per page
  - `bookmark` (string): Pagination bookmark
- **Output**: PaginatedShipmentResponse
- **Frontend**:
  - Work queue: List of shipments awaiting certification
  - Filters: Date submitted, farm location, product type

### Action: Record Certification
- **Chaincode Function**: `RecordCertification`
- **Type**: transaction
- **Parameters**:
  - `shipmentID` (string): Shipment to certify
  - `inspectionDateStr` (string): Date of inspection (RFC3339)
  - `inspectionReportHash` (string): Hash of inspection report
  - `certStatusStr` (string): "APPROVED"/"REJECTED"/"PENDING"
  - `comments` (string): Certification comments
- **JSON Input**:
```json
{
  "shipmentID": "SHIP001",
  "inspectionDateStr": "2024-07-22T00:00:00Z",
  "inspectionReportHash": "report-hash-123",
  "certStatusStr": "APPROVED",
  "comments": "All organic standards met. Excellent farming practices observed."
}
```
- **Output**: Success message
- **Frontend**:
  - Certification form:
    1. Inspection Details: inspectionDate (date picker), report upload (generates hash)
    2. Decision: Radio buttons (Approve/Reject/Pending)
    3. Comments: Textarea for detailed notes
  - Buttons: "Submit Certification", "Save as Pending"

---

## Common Queries (All Actors)

### Action: View Shipment Details
- **Chaincode Function**: `GetShipmentPublicDetails`
- **Type**: query
- **Parameters**:
  - `shipmentID` (string): Shipment ID
- **Output**: Complete Shipment object with history
- **Frontend**:
  - Detail page with tabs:
    1. Overview: Basic shipment info
    2. Supply Chain: Visual timeline of all stages
    3. Certifications: List of certification records
    4. History: Transaction history table
    5. Recall Status: If applicable

---

## System Flow

### Normal Flow
1. **Farmer** creates shipment with harvest details and designates processor
2. **Farmer** (optional) submits shipment for organic certification
3. **Certifier** (optional) inspects and records certification decision
4. **Processor** receives and processes the shipment, designates distributor
5. **Distributor** picks up and delivers shipment to designated retailer
6. **Retailer** receives shipment and puts it on sale
7. **Consumer** can scan QR code to see complete supply chain history

### Transformation Flow
1. **Processor** receives multiple input shipments
2. **Processor** uses TransformAndCreateProducts to consume inputs and create new products
3. New derived products continue through distribution → retail flow

### Recall Flow
1. Any **current owner** or **Admin** initiates recall on a shipment
2. **Admin** can link related shipments to the recall event
3. All recalled shipments show recall status in queries
4. System can query for potentially affected shipments based on shared processing lines, distribution routes, or farm origins

---

## Frontend Architecture Recommendations

### Technology Stack
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Components**: Material-UI or Ant Design
- **Forms**: React Hook Form with Yup validation
- **API Client**: Axios with interceptors for auth
- **Charts**: Chart.js for analytics dashboards

### Key Components
1. **RoleBasedLayout**: Different navigation and dashboards per role
2. **ShipmentTable**: Reusable table with sorting, filtering, pagination
3. **ShipmentForm**: Multi-step form wizard for complex operations
4. **TimelineView**: Visual supply chain progress
5. **QRGenerator**: Generate trackable QR codes
6. **NotificationSystem**: Real-time updates on shipment status changes

### API Integration Pattern
```javascript
// Example API call structure
const createShipment = async (data) => {
  const payload = {
    shipmentID: data.shipmentID,
    productName: data.productName,
    description: data.description,
    quantity: parseFloat(data.quantity),
    unitOfMeasure: data.unitOfMeasure,
    farmerDataJSON: JSON.stringify({
      farmerName: data.farmerName,
      farmLocation: data.farmLocation,
      cropType: data.cropType,
      plantingDate: data.plantingDate.toISOString(),
      fertilizerUsed: data.fertilizerUsed,
      certificationDocumentHash: data.certificationDocumentHash,
      harvestDate: data.harvestDate.toISOString(),
      farmingPractice: data.farmingPractice,
      destinationProcessorId: data.destinationProcessorId
    })
  };
  
  return await api.post('/chaincode/CreateShipment', payload);
};
```

### Security Considerations
1. **Authentication**: X.509 certificate-based auth matching Fabric identities
2. **Authorization**: Frontend role checks + backend validation
3. **Input Validation**: Client and server-side validation
4. **Audit Trail**: Log all transactions with actor information