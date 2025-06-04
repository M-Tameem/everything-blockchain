import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

export interface Shipment {
  id: string
  shipmentID?: string
  productName?: string
  status?: string
  [key: string]: unknown
}

export function useMyShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchShipments = async () => {
      try {
        const resp = await apiClient.getMyShipments(50);
        if (isMounted) {
          setShipments(resp.shipments || []);
        }
      } catch (err) {
        console.error('Failed to fetch my shipments', err);
        if (isMounted) setShipments([]);
      }
    };
    fetchShipments();
    return () => { isMounted = false; };
  }, []);

  return shipments;
}
