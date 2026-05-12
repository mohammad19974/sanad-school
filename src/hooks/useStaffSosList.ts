// hook حيّ لقائمة طلبات النجدة (للمنسّق)

import { useEffect, useState } from 'react';
import { watchAllSOSRequests } from '../api/sosApi';
import type { SOSRequest } from '../types';

interface Result {
  requests: SOSRequest[];
  active: SOSRequest[];
  acknowledged: SOSRequest[];
  resolved: SOSRequest[];
  loading: boolean;
}

export const useStaffSosList = (): Result => {
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsub = watchAllSOSRequests((list) => {
      setRequests(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return {
    requests,
    active:       requests.filter((r) => r.status === 'pending'),
    acknowledged: requests.filter((r) => r.status === 'acknowledged' || r.status === 'enroute'),
    resolved:     requests.filter((r) => r.status === 'resolved' || r.status === 'cancelled'),
    loading,
  };
};
