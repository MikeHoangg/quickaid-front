import {ApiService} from './api.service';

export function loadUserProvider(provider: ApiService) {
  return () => provider.loadUser();
}



