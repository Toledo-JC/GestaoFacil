import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineState {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: true,
    isConnected: true,
    connectionType: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      setState({
        isOnline: netState.isInternetReachable ?? true,
        isConnected: netState.isConnected ?? true,
        connectionType: netState.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
}
